import { Server, Socket } from "socket.io";
import { container } from "tsyringe";
import redisClient from "../config/redisConfig";
import ChatService from "../services/chat/chatService";
import GroupService from "../services/chat/groupService";
import ConnectionService from "../services/connection/connectionService";
import NotificationService from "../services/notification/notificationService";
import { ChatMessagePayload } from "../interfaces/IMessage";
import User from "../models/userModel";
import AdminModel from "../models/adminModel";
import { verifyAccessToken } from "../utils/jwt";

type CallType = "audio" | "video";

interface ActiveCallSession {
  callId: string;
  callType: CallType;
  isGroup: boolean;
  groupId?: string;
  groupName?: string;
  callerId: string;
  participants: Map<string, string>;
  invitees: Map<string, string>;
  createdAt: number;
}

export const initializeSocket = (io: Server) => {
  const activeCalls = new Map<string, ActiveCallSession>();

  const emitToCallMembers = (
    call: ActiveCallSession,
    event: string,
    payload: Record<string, unknown>,
    excludeUserId?: string
  ): void => {
    const memberIds = new Set([
      ...call.participants.keys(),
      ...call.invitees.keys(),
    ]);

    memberIds.forEach((memberId) => {
      if (memberId !== excludeUserId) {
        io.to(memberId).emit(event, payload);
      }
    });
  };

  const endCallSession = (
    callId: string,
    endedBy: string
  ): void => {
    const call = activeCalls.get(callId);
    if (!call) return;

    emitToCallMembers(call, "call_ended", {
      callId,
      endedBy,
    });

    activeCalls.delete(callId);
  };

  io.on("connection", async (socket: Socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);

    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.query.token as string);

    if (!token || token === "undefined" || token === "null") {
      console.warn("❌ Socket rejected – missing auth token");
      socket.disconnect(true);
      return;
    }

    let userId: string;
    let currentUser: { name?: string; isActive?: boolean } | null = null;
    try {
      const decoded = await verifyAccessToken(token);
      if (!decoded?.id) throw new Error("Invalid token payload");
      userId = decoded.id;

      if (decoded.role === "admin") {
        const admin = await AdminModel.findById(userId).select("isActive").lean();
        if (!admin?.isActive) throw new Error("Inactive account");
      } else {
        currentUser = await User.findById(userId).select("name isActive").lean();
        if (!currentUser?.isActive) throw new Error("Inactive account");
      }
    } catch {
      console.warn("❌ Socket rejected – invalid or inactive auth token");
      socket.disconnect(true);
      return;
    }

    const chatService = container.resolve(ChatService);
    const groupService = container.resolve(GroupService);
    const connectionService = container.resolve(ConnectionService);
    const notificationService = container.resolve(NotificationService);
    const allowedGroupIds = new Set<string>();

    const userName = currentUser?.name ?? "";

    console.log(`✅ User connected: ${userId} (socket: ${socket.id})`);

    // Join the personal room before advertising the user as online so an
    // incoming call cannot be emitted to a room the socket has not joined yet.
    socket.join(userId);

    // Redis should not prevent Socket.IO message handlers from registering.
    try {
      await redisClient.set(`socket:${userId}`, socket.id);
      await redisClient.set(`online:${userId}`, "1");

      console.log("Redis online status updated:", userId);
    } catch (error) {
      console.error("Redis online status error:", error);
    }

    io.emit("user_status", {
      userId,
      online: true,
      lastSeen: null,
    });

    try {
      const userGroups = await groupService.getGroupsForUser(userId);
      userGroups.forEach((group) => {
        const groupId = group._id.toString();
        allowedGroupIds.add(groupId);
        socket.join(`group:${groupId}`);
      });
    } catch (error) {
      console.error("Failed to join group rooms:", error);
    }

    socket.on("get_online_users", async () => {
      const keys = await redisClient.keys("online:*");
      const onlineUserIds = keys.map((k) => k.replace("online:", ""));
      socket.emit("online_users", onlineUserIds);
    });

    socket.on("join_groups", async (groupIds: string[]) => {
      try {
        const userGroups = await groupService.getGroupsForUser(userId);
        const nextGroupIds = new Set(userGroups.map((group) => group._id.toString()));

        for (const groupId of allowedGroupIds) {
          if (!nextGroupIds.has(groupId)) {
            socket.leave(`group:${groupId}`);
          }
        }

        allowedGroupIds.clear();
        nextGroupIds.forEach((groupId) => allowedGroupIds.add(groupId));
      } catch (error) {
        console.error("Failed to refresh group rooms:", error);
      }

      groupIds
        .filter((id) => allowedGroupIds.has(id))
        .forEach((id) => socket.join(`group:${id}`));
    });

    console.log("✅ SEND_MESSAGE HANDLER REGISTERED:", userId);

    // ─── Send DM ──────────────────────────────────────────────────────
    socket.on(
      "send_message",
      async (
        data: {
          receiverId: string;
          tempId: string;
        } & ChatMessagePayload
      ) => {
        console.log("📩 BACKEND RECEIVED MESSAGE:", { receiverId: data?.receiverId });

        try {
          if (!data?.receiverId || data.receiverId === userId) {
            throw new Error("Invalid receiver");
          }

          console.log("Saving message to database...");

          const saved = await chatService.saveMessage(userId, data.receiverId, {
            text: data.text,
            type: data.type,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            postId: data.postId,
            eventId: data.eventId,
          });

          const payload = {
            _id: saved._id.toString(),
            tempId: data.tempId,
            senderId: userId,
            receiverId: data.receiverId,
            text: saved.text,
            type: saved.type ?? "text",
            fileUrl: saved.fileUrl,
            fileName: saved.fileName,
            fileSize: saved.fileSize,
            mimeType: saved.mimeType,
            postId: saved.postId,
            postContent: saved.postContent,
            postMedia: saved.postMedia,
            postAuthorName: saved.postAuthorName,
            eventId: saved.eventId,
            eventTitle: saved.eventTitle,
            eventImage: saved.eventImage,
            eventStartDate: saved.eventStartDate,
            eventStartTime: saved.eventStartTime,
            eventVenue: saved.eventVenue,
            eventCity: saved.eventCity,
            seen: false,
            createdAt: saved.createdAt,
          };
          console.log("Message saved successfully:", saved._id);

          io.to(data.receiverId).emit("receive_message", payload);
          socket.emit("message_sent", payload);

          void (async () => {
            try {
              const isOnline = await redisClient.get(`online:${data.receiverId}`);

              if (!isOnline) {
                const preview =
                  saved.type === "post"
                    ? "shared a post"
                    : saved.type === "event"
                      ? "shared an event"
                      : (saved.text ?? "").slice(0, 120);

                await notificationService.notifyMessage(
                  userId,
                  data.receiverId,
                  preview
                );
              }
            } catch (notificationError) {
              console.error("DM notification error:", notificationError);
            }
          })();
        } catch (error) {
          console.error(
            "❌ send_message ERROR:",
            error instanceof Error ? error.message : error
          );

          socket.emit("message_error", {
            tempId: data?.tempId,
            message:
              error instanceof Error && error.message === "NOT_CONNECTED"
                ? "You can only message people you are connected with."
                : error instanceof Error
                ? error.message
                : "Failed to send message",
          });
        }
      }
    );

    socket.on(
      "mark_seen",
      async (data: { messageIds: string[]; senderId?: string }) => {
        try {
          const senderIds = await chatService.markSeen(data.messageIds, userId);
          senderIds.forEach((senderId) => {
            io.to(senderId).emit("messages_seen", {
              messageIds: data.messageIds,
            });
          });
        } catch (error) {
          console.error("mark_seen error:", error);
        }
      }
    );

    socket.on("typing", async (data: { to: string }) => {
      if (!data?.to || data.to === userId) return;

      try {
        if (!(await connectionService.areConnected(userId, data.to))) return;
        io.to(data.to).emit("typing", { from: userId });
      } catch {
        // Ignore invalid recipients.
      }
    });

    socket.on("stop_typing", async (data: { to: string }) => {
      if (!data?.to || data.to === userId) return;

      try {
        if (!(await connectionService.areConnected(userId, data.to))) return;
        io.to(data.to).emit("stop_typing", { from: userId });
      } catch {
        // Ignore invalid recipients.
      }
    });

    // Group message handlers
    socket.on(
      "send_group_message",
      async (
        data: {
          groupId: string;
          tempId: string;
          senderName?: string;
        } & ChatMessagePayload
      ) => {
        try {
          const saved = await groupService.saveGroupMessage(
            data.groupId,
            userId,
            {
              text: data.text,
              type: data.type,
              fileUrl: data.fileUrl,
              fileName: data.fileName,
              fileSize: data.fileSize,
              mimeType: data.mimeType,
              postId: data.postId,
              eventId: data.eventId,
            }
          );
          const memberIds = await groupService.getGroupMemberIds(data.groupId, userId);

          const payload = {
            _id: saved._id.toString(),
            tempId: data.tempId,
            groupId: data.groupId,
            senderId: userId,
            senderName: userName,
            text: saved.text,
            type: saved.type ?? "text",
            fileUrl: saved.fileUrl,
            fileName: saved.fileName,
            fileSize: saved.fileSize,
            mimeType: saved.mimeType,
            postId: saved.postId,
            postContent: saved.postContent,
            postMedia: saved.postMedia,
            postAuthorName: saved.postAuthorName,
            eventId: saved.eventId,
            eventTitle: saved.eventTitle,
            eventImage: saved.eventImage,
            eventStartDate: saved.eventStartDate,
            eventStartTime: saved.eventStartTime,
            eventVenue: saved.eventVenue,
            eventCity: saved.eventCity,
            seenBy: [userId],
            createdAt: saved.createdAt,
          };

          memberIds.forEach((memberId) => {
            if (memberId !== userId) {
              io.to(memberId).emit("receive_group_message", payload);
            }
          });
          socket.emit("group_message_sent", payload);

          void (async () => {
            try {
              const group = await groupService.getGroupById(data.groupId);
              const groupName = group?.name ?? "a group";
              const preview =
                saved.type === "post"
                  ? "shared a post"
                  : saved.type === "event"
                    ? "shared an event"
                    : (saved.text ?? "").slice(0, 120);

              await Promise.all(
                memberIds
                  .filter((memberId) => memberId !== userId)
                  .map(async (memberId) => {
                    const isOnline = await redisClient.get(
                      `online:${memberId}`
                    );

                    if (!isOnline) {
                      await notificationService.notifyMessage(
                        userId,
                        memberId,
                        preview,
                        groupName,
                        data.groupId
                      );
                    }
                  })
              );
            } catch (notificationError) {
              console.error("Group notification error:", notificationError);
            }
          })();
        } catch (error) {
          console.error("send_group_message error:", error);
          socket.emit("group_message_error", {
            tempId: data.tempId,
            message:
              error instanceof Error
                ? error.message
                : "Failed to send message",
          });
        }
      }
    );

    socket.on(
      "mark_group_seen",
      async (data: { messageIds: string[]; groupId: string }) => {
        try {
          const memberIds = await groupService.getGroupMemberIds(data.groupId, userId);

          await groupService.markGroupMessagesSeen(data.messageIds, userId);
          memberIds.forEach((memberId) => {
            if (memberId !== userId) {
              io.to(memberId).emit("group_messages_seen", {
                messageIds: data.messageIds,
                seenBy: userId,
              });
            }
          });
        } catch (error) {
          console.error("mark_group_seen error:", error);
        }
      }
    );

    socket.on(
      "group_typing",
      async (data: { groupId: string; from?: string; fromName?: string }) => {
        try {
          const memberIds = await groupService.getGroupMemberIds(data.groupId, userId);
          memberIds.forEach((memberId) => {
            if (memberId !== userId) {
              io.to(memberId).emit("group_typing", {
                groupId: data.groupId,
                from: userId,
                fromName: userName,
              });
            }
          });
        } catch (error) {
          console.error("group_typing error:", error);
        }
      }
    );

    socket.on(
      "group_stop_typing",
      async (data: { groupId: string; from?: string }) => {
        try {
          const memberIds = await groupService.getGroupMemberIds(data.groupId, userId);
          memberIds.forEach((memberId) => {
            if (memberId !== userId) {
              io.to(memberId).emit("group_stop_typing", {
                groupId: data.groupId,
                from: userId,
              });
            }
          });
        } catch (error) {
          console.error("group_stop_typing error:", error);
        }
      }
    );

    // ─── WebRTC call signaling ─────────────────────────────────────────
    socket.on(
      "call_start",
      async (data: {
        callId: string;
        callType: CallType;
        targetUserId?: string;
        groupId?: string;
      }) => {
        try {
          const callId = data?.callId?.trim();
          const callType = data?.callType;

          if (
            !callId ||
            (callType !== "audio" && callType !== "video")
          ) {
            socket.emit("call_error", {
              callId: data?.callId,
              message: "Invalid call request",
            });
            return;
          }

          const alreadyBusy = [...activeCalls.values()].some(
            (call) =>
              call.participants.has(userId) ||
              call.invitees.has(userId)
          );

          if (alreadyBusy) {
            socket.emit("call_error", {
              callId,
              message: "You are already in a call",
            });
            return;
          }

          let targetIds: string[] = [];
          let isGroup = false;
          let groupName: string | undefined;
          let groupId: string | undefined;

          if (data.groupId) {
            isGroup = true;
            groupId = data.groupId;

            const memberIds = await groupService.getGroupMemberIds(
              groupId,
              userId
            );

            targetIds = memberIds.filter((memberId) => memberId !== userId);

            const group = await groupService.getGroupById(groupId);
            groupName = group?.name;
          } else {
            const targetUserId = data.targetUserId;

            if (!targetUserId || targetUserId === userId) {
              socket.emit("call_error", {
                callId,
                message: "Invalid call recipient",
              });
              return;
            }

            if (
              !(await connectionService.areConnected(
                userId,
                targetUserId
              ))
            ) {
              socket.emit("call_error", {
                callId,
                message:
                  "You can only call people you are connected with.",
              });
              return;
            }

            targetIds = [targetUserId];
          }

          const onlineTargetIds: string[] = [];
          const busyUserIds = new Set<string>();

          for (const activeCall of activeCalls.values()) {
            activeCall.participants.forEach((_name, participantId) => {
              busyUserIds.add(participantId);
            });
            activeCall.invitees.forEach((_name, inviteeId) => {
              busyUserIds.add(inviteeId);
            });
          }

          for (const targetId of targetIds) {
            if (busyUserIds.has(targetId)) continue;

            if (await redisClient.get(`online:${targetId}`)) {
              onlineTargetIds.push(targetId);
            }
          }

          if (onlineTargetIds.length === 0) {
            socket.emit("call_unavailable", {
              callId,
              message: isGroup
                ? "No other group members are available right now."
                : "This person is unavailable right now.",
            });
            return;
          }

          const targetUsers = await User.find({
            _id: { $in: onlineTargetIds },
          })
            .select("name")
            .lean();

          const targetNameById = new Map(
            targetUsers.map((targetUser) => [
              targetUser._id.toString(),
              targetUser.name ?? "",
            ])
          );

          const call: ActiveCallSession = {
            callId,
            callType,
            isGroup,
            groupId,
            groupName,
            callerId: userId,
            participants: new Map([[userId, userName]]),
            invitees: new Map(
              onlineTargetIds.map((targetId) => [
                targetId,
                targetNameById.get(targetId) ?? "",
              ])
            ),
            createdAt: Date.now(),
          };

          activeCalls.set(callId, call);

          const callerUser = await User.findById(userId)
            .select("name profileImage")
            .lean();

          const invitePayload = {
            callId,
            callType,
            isGroup,
            groupId,
            groupName,
            callerId: userId,
            callerName: userName,
            callerImage: callerUser?.profileImage ?? null,
          };

          onlineTargetIds.forEach((targetId) => {
            io.to(targetId).emit("call_incoming", invitePayload);
          });

          socket.emit("call_created", {
            callId,
            callType,
            isGroup,
            groupId,
            groupName,
            participants: [
              { userId, name: userName },
            ],
          });
        } catch (error) {
          console.error("call_start error:", error);
          socket.emit("call_error", {
            callId: data?.callId,
            message:
              error instanceof Error
                ? error.message
                : "Failed to start call",
          });
        }
      }
    );

    socket.on(
      "call_accept",
      (data: { callId: string }) => {
        const call = activeCalls.get(data?.callId);
        if (!call || !call.invitees.has(userId)) return;

        call.invitees.delete(userId);
        call.participants.set(userId, userName);

        const existingParticipants = [...call.participants.entries()]
          .filter(([participantId]) => participantId !== userId)
          .map(([participantId, name]) => ({
            userId: participantId,
            name,
          }));

        socket.emit("call_joined", {
          callId: call.callId,
          callType: call.callType,
          isGroup: call.isGroup,
          groupId: call.groupId,
          groupName: call.groupName,
          participants: existingParticipants,
        });

        existingParticipants.forEach((participant) => {
          io.to(participant.userId).emit("call_peer_joined", {
            callId: call.callId,
            userId,
            name: userName,
          });
        });
      }
    );

    socket.on(
      "call_reject",
      (data: { callId: string }) => {
        const call = activeCalls.get(data?.callId);
        if (!call || !call.invitees.has(userId)) return;

        call.invitees.delete(userId);

        emitToCallMembers(
          call,
          "call_rejected",
          {
            callId: call.callId,
            userId,
            name: userName,
          },
          userId
        );

        if (
          call.invitees.size === 0 &&
          call.participants.size <= 1
        ) {
          endCallSession(call.callId, userId);
        }
      }
    );

    // The invitee could not join because their microphone/camera was not
    // available or permission was denied. This must not be reported to the
    // caller as a rejection – it is a media/device failure.
    socket.on(
      "call_media_failed",
      (data: { callId: string; reason?: string }) => {
        const call = activeCalls.get(data?.callId);
        if (!call || !call.invitees.has(userId)) return;

        call.invitees.delete(userId);

        emitToCallMembers(
          call,
          "call_failed",
          {
            callId: call.callId,
            callType: call.callType,
            userId,
            name: userName,
            reason: data.reason || "unknown",
          },
          userId
        );

        if (
          call.invitees.size === 0 &&
          call.participants.size <= 1
        ) {
          endCallSession(call.callId, userId);
        }
      }
    );

    socket.on(
      "call_leave",
      (data: { callId: string }) => {
        const call = activeCalls.get(data?.callId);
        if (!call) return;

        call.participants.delete(userId);
        call.invitees.delete(userId);

        emitToCallMembers(
          call,
          "call_peer_left",
          {
            callId: call.callId,
            userId,
          },
          userId
        );

        if (call.participants.size === 0) {
          endCallSession(call.callId, userId);
        } else if (
          !call.isGroup &&
          call.participants.size < 2
        ) {
          endCallSession(call.callId, userId);
        }
      }
    );

    socket.on(
      "call_end",
      (data: { callId: string }) => {
        const call = activeCalls.get(data?.callId);
        if (!call) return;

        if (
          !call.participants.has(userId) &&
          !call.invitees.has(userId)
        ) {
          return;
        }

        endCallSession(call.callId, userId);
      }
    );

    socket.on(
      "webrtc_offer",
      (data: {
        callId: string;
        targetUserId: string;
        sdp: RTCSessionDescriptionInit;
      }) => {
        const call = activeCalls.get(data?.callId);
        if (
          !call ||
          !call.participants.has(userId) ||
          !call.participants.has(data.targetUserId)
        ) {
          return;
        }

        io.to(data.targetUserId).emit("webrtc_offer", {
          callId: call.callId,
          fromUserId: userId,
          sdp: data.sdp,
        });
      }
    );

    socket.on(
      "webrtc_answer",
      (data: {
        callId: string;
        targetUserId: string;
        sdp: RTCSessionDescriptionInit;
      }) => {
        const call = activeCalls.get(data?.callId);
        if (
          !call ||
          !call.participants.has(userId) ||
          !call.participants.has(data.targetUserId)
        ) {
          return;
        }

        io.to(data.targetUserId).emit("webrtc_answer", {
          callId: call.callId,
          fromUserId: userId,
          sdp: data.sdp,
        });
      }
    );

    socket.on(
      "webrtc_ice_candidate",
      (data: {
        callId: string;
        targetUserId: string;
        candidate: RTCIceCandidateInit;
      }) => {
        const call = activeCalls.get(data?.callId);
        if (
          !call ||
          !call.participants.has(userId) ||
          !call.participants.has(data.targetUserId)
        ) {
          return;
        }

        io.to(data.targetUserId).emit(
          "webrtc_ice_candidate",
          {
            callId: call.callId,
            fromUserId: userId,
            candidate: data.candidate,
          }
        );
      }
    );

    socket.on(
      "call_peer_state",
      (data: {
        callId: string;
        muted?: boolean;
        cameraOff?: boolean;
      }) => {
        const call = activeCalls.get(data?.callId);
        if (!call || !call.participants.has(userId)) return;

        // Only forward fields the sender actually provided. Coercing a missing
        // field to false would incorrectly mark a peer's camera as on (or
        // their microphone as unmuted) when the client only toggled the other
        // control.
        const payload: Record<string, unknown> = {
          callId: call.callId,
          userId,
        };

        if (typeof data.muted === "boolean") {
          payload.muted = data.muted;
        }

        if (typeof data.cameraOff === "boolean") {
          payload.cameraOff = data.cameraOff;
        }

        emitToCallMembers(call, "call_peer_state", payload, userId);
      }
    );

    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${userId}`);

      for (const [callId, call] of activeCalls) {
        if (
          !call.participants.has(userId) &&
          !call.invitees.has(userId)
        ) {
          continue;
        }

        call.participants.delete(userId);
        call.invitees.delete(userId);

        emitToCallMembers(
          call,
          "call_peer_left",
          { callId, userId },
          userId
        );

        if (call.participants.size === 0) {
          endCallSession(callId, userId);
        } else if (!call.isGroup && call.participants.size < 2) {
          endCallSession(callId, userId);
        }
      }

      try {
        await redisClient.del(`socket:${userId}`);
        await redisClient.del(`online:${userId}`);
      } catch (error) {
        console.error("Redis disconnect cleanup error:", error);
      }

      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { lastSeen });
      io.emit("user_status", { userId, online: false, lastSeen });
    });
  });
};