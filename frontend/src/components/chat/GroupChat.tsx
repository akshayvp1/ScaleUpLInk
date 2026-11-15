// GroupChat.tsx
// Full group chat area — mirrors Chat.tsx structure but uses group socket events,
// groupMessages from Redux, and shows sender name on each message.

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import ChatComposer, {
  ChatAttachmentPayload,
} from "./ChatComposer";
import MessageContent from "./MessageContent";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  setGroupMessages,
  addGroupMessage,
  replaceGroupMessage,
  markGroupMessageError,
  markGroupMessagesSeen,
} from "../../redux/features/chat/groupSlice";
import type { Group, GroupMessage, SharedPostPayload } from "../../types/chat/types";
import groupService from "../../services/chat/groupService";
import { socket } from "../../socket/socket";
import { useCall } from "../../context/call/callContext";

const BRAND_COLOR = "var(--primary)";

function Avatar({
  initials,
  size = "md",
  color,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color ?? BRAND_COLOR }}
    >
      {initials}
    </div>
  );
}

// Generate a consistent color per sender so each member has a unique bubble color
function getSenderColor(senderId: string): string {
  const colors = [
    "#e05c7a", "#e07a5f", "#3d405b", "#81b29a",
    "#f2cc8f", "#6a4c93", "#1982c4", "#8ac926",
  ];
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface GroupChatProps {
  selectedGroup: Group;
  onBack: () => void;
}

export default function GroupChat({ selectedGroup, onBack }: GroupChatProps) {
  const dispatch = useAppDispatch();
  const { startCall } = useCall();
  const currentUserId = useAppSelector((s) => s.auth.user?._id ?? s.auth.user?.id ?? "");
  const currentUserName = useAppSelector((s) => s.auth.user?.name ?? "");
  const groupMessages = useAppSelector((s) => s.group.groupMessages);

  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedGroupRef = useRef<Group | null>(null);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  // ── Fetch messages when group changes ────────────────────────────────────────
  useEffect(() => {
    if (!selectedGroup) return;
    async function fetchMessages() {
      const res = await groupService.getGroupMessages(selectedGroup._id);
      if (res.success && res.data) {
        const loaded: GroupMessage[] = res.data.map((m) => ({
          ...m,
          status: "sent" as const,
        }));
        dispatch(setGroupMessages(loaded));

        const unreadIds = loaded
          .filter(
            (m) =>
              m.senderId !== currentUserId &&
              !(m.seenBy ?? []).includes(currentUserId)
          )
          .map((m) => m._id);

        if (unreadIds.length > 0) {
          socket.emit("mark_group_seen", {
            messageIds: unreadIds,
            groupId: selectedGroup._id,
          });
        }
      }
    }
    fetchMessages();
  }, [selectedGroup._id, currentUserId, dispatch]);

  // ── Socket: join group room + listen for group events ────────────────────────
  useEffect(() => {
    if (!currentUserId || !selectedGroup) return;

    socket.emit("join_groups", [selectedGroup._id]);

    function onReceiveGroupMessage(payload: GroupMessage) {
      if (payload.groupId !== selectedGroupRef.current?._id) {
        return;
      }

      dispatch(addGroupMessage({ ...payload, status: "sent" }));

      socket.emit("mark_group_seen", {
        messageIds: [payload._id],
        groupId: payload.groupId,
      });
    }

    function onGroupMessageSent(payload: GroupMessage) {
      dispatch(replaceGroupMessage({ ...payload, status: "sent" }));
    }

    function onGroupMessagesSeen({
      messageIds,
      seenBy,
    }: {
      messageIds: string[];
      seenBy: string;
    }) {
      dispatch(markGroupMessagesSeen({ messageIds, userId: seenBy }));
    }

    function onGroupMessageError({
      tempId,
      message,
    }: {
      tempId: string;
      message?: string;
    }) {
      dispatch(markGroupMessageError(tempId));
      if (message) toast.error(message);
    }

    function onGroupTyping({ from, fromName, groupId }: { from: string; fromName: string; groupId: string }) {
      if (groupId !== selectedGroupRef.current?._id) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(from, fromName);
        return next;
      });
    }

    function onGroupStopTyping({ from, groupId }: { from: string; groupId: string }) {
      if (groupId !== selectedGroupRef.current?._id) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(from);
        return next;
      });
    }

    socket.on("receive_group_message", onReceiveGroupMessage);
    socket.on("group_message_sent", onGroupMessageSent);
    socket.on("group_messages_seen", onGroupMessagesSeen);
    socket.on("group_message_error", onGroupMessageError);
    socket.on("group_typing", onGroupTyping);
    socket.on("group_stop_typing", onGroupStopTyping);

    return () => {
      socket.off("receive_group_message", onReceiveGroupMessage);
      socket.off("group_message_sent", onGroupMessageSent);
      socket.off("group_messages_seen", onGroupMessagesSeen);
      socket.off("group_message_error", onGroupMessageError);
      socket.off("group_typing", onGroupTyping);
      socket.off("group_stop_typing", onGroupStopTyping);
    };
  }, [currentUserId, selectedGroup._id, dispatch]);

  // ── Send message ─────────────────────────────────────────────────────────────
  function emitGroupMessage(payload: {
    text?: string;
    type?: GroupMessage["type"];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    postId?: string;
    postContent?: string;
    postMedia?: string;
    postAuthorName?: string;
  }) {
    if (!currentUserId) return;

    const tempId = `temp_${Date.now()}`;
    const text = payload.text ?? "";

    const optimistic: GroupMessage = {
      _id: tempId,
      tempId,
      groupId: selectedGroup._id,
      senderId: currentUserId,
      senderName: currentUserName,
      text,
      type: payload.type ?? "text",
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      mimeType: payload.mimeType,
      postId: payload.postId,
      postContent: payload.postContent,
      postMedia: payload.postMedia,
      postAuthorName: payload.postAuthorName,
      seenBy: [currentUserId],
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    dispatch(addGroupMessage(optimistic));

    socket.emit("send_group_message", {
      groupId: selectedGroup._id,
      senderId: currentUserId,
      senderName: currentUserName,
      tempId,
      ...payload,
      text,
    });
  }

  function sendMessage() {
    if (!newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage("");
    emitGroupMessage({ text, type: "text" });
  }

  function sendSticker(sticker: string) {
    emitGroupMessage({ text: sticker, type: "sticker" });
  }

  function sendAttachment(payload: ChatAttachmentPayload) {
    const caption = newMessage.trim();
    if (caption) setNewMessage("");

    emitGroupMessage({
      text: caption,
      type: payload.type,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      mimeType: payload.mimeType,
    });
  }

  function sendPost(post: SharedPostPayload) {
    const caption = newMessage.trim();
    if (caption) setNewMessage("");

    emitGroupMessage({
      text: caption,
      type: "post",
      postId: post.postId,
      postContent: post.postContent,
      postMedia: post.postMedia,
      postAuthorName: post.postAuthorName,
    });
  }

  // ── Typing indicator ─────────────────────────────────────────────────────────
  function handleInputChange(value: string) {
    setNewMessage(value);
    if (!currentUserId) return;

    socket.emit("group_typing", {
      groupId: selectedGroup._id,
      from: currentUserId,
      fromName: currentUserName,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("group_stop_typing", {
        groupId: selectedGroup._id,
        from: currentUserId,
      });
    }, 1500);
  }

  const typingList = Array.from(typingUsers.values()).filter(Boolean);
  const typingText =
    typingList.length === 1
      ? `${typingList[0]} is typing...`
      : typingList.length > 1
      ? `${typingList.join(", ")} are typing...`
      : null;

  const memberCount = selectedGroup.members.length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-muted/20">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/70 bg-card px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="sm:hidden text-muted-foreground hover:text-foreground mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Users className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{selectedGroup.name}</p>
          <p className="text-xs text-muted-foreground">
            {typingText ? (
              <span className="text-primary italic">{typingText}</span>
            ) : (
              `${memberCount} member${memberCount !== 1 ? "s" : ""}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              void startCall({
                callType: "audio",
                groupId: selectedGroup._id,
                groupName: selectedGroup.name,
              })
            }
            aria-label={`Audio call ${selectedGroup.name}`}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              void startCall({
                callType: "video",
                groupId: selectedGroup._id,
                groupName: selectedGroup.name,
              })
            }
            aria-label={`Video call ${selectedGroup.name}`}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
        {groupMessages.length > 0 ? (
          groupMessages.map((message) => {
            const isMe = message.senderId === currentUserId;
            const senderColor = getSenderColor(message.senderId);

            return (
              <div
                key={message._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="mr-2 mt-auto">
                    <Avatar
                      initials={message.senderName?.charAt(0).toUpperCase() ?? "?"}
                      size="sm"
                      color={senderColor}
                    />
                  </div>
                )}

                <div
                  className={`max-w-[75%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
                    isMe
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm border border-border/70 bg-card text-foreground shadow-sm"
                  } ${message.status === "error" ? "opacity-50" : ""}`}
                  style={isMe ? { backgroundColor: BRAND_COLOR } : {}}
                >
                  {/* Show sender name in group messages for others */}
                  {!isMe && (
                    <p
                      className="text-[11px] font-semibold mb-1"
                      style={{ color: senderColor }}
                    >
                      {message.senderName}
                    </p>
                  )}

                  <MessageContent message={message} isMe={isMe} />

                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`text-[10px] ${
                        isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-primary-foreground/70">
                        {message.status === "sending"
                          ? "⏳"
                          : (message.seenBy ?? []).length > 1
                          ? "✓✓"
                          : "✓"}
                      </span>
                    )}
                    {message.status === "error" && (
                      <span className="text-[10px] text-destructive ml-1">Failed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="mt-20 flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
              <Send className="h-5 w-5" style={{ color: BRAND_COLOR }} />
            </div>
            <p className="text-sm font-semibold text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Say hi to the group!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatComposer
        value={newMessage}
        onChange={handleInputChange}
        onSend={sendMessage}
        onSendSticker={sendSticker}
        onSendAttachment={sendAttachment}
        onSendPost={sendPost}
        placeholder="Message group..."
      />
    </div>
  );
}