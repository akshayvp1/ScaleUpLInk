import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { Server } from "socket.io";
import GroupService from "../../services/chat/groupService";
import { IGroupController } from "./interface/IGroupController";

function getUserId(req: Request): string {
  if (!req.user?.id) throw new Error("Unauthorized");
  return req.user.id;
}

function sendError(res: Response, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : "";
  const forbidden =
    message === "Not a group member" ||
    message === "Only group admin can perform this action" ||
    message === "Group admin cannot leave the group";
  const badRequest =
    message === "Invalid group id" ||
    message === "Invalid user id" ||
    message === "User is not eligible to join this group" ||
    message === "You can only add people you are connected with" ||
    message === "Group name is required" ||
    message === "Group name is too long" ||
    message === "Description is too long" ||
    message === "Invalid post" ||
    message === "Post not found";
  const notFound = message === "User not found";
  const status = forbidden ? 403 : notFound ? 404 : badRequest ? 400 : 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? fallback : message,
  });
}

function setGroupRoomMembership(req: Request, userId: string, groupId: string, join: boolean): void {
  const io = req.app.get("io") as Server | undefined;
  if (!io) return;

  const room = `group:${groupId}`;
  if (join) {
    io.in(userId).socketsJoin(room);
  } else {
    io.in(userId).socketsLeave(room);
  }
}

@injectable()
class GroupController implements IGroupController {
  constructor(@inject("GroupService") private groupService: GroupService) {}

  createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = getUserId(req);
      const { name, description, memberIds } = req.body as {
        name: string;
        description: string;
        memberIds: string[];
      };
      const group = await this.groupService.createGroup(
        name,
        description,
        adminId,
        memberIds,
      );
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      sendError(res, error, "Failed to create group");
    }
  };

  getMyGroups = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const groups = await this.groupService.getGroupsForUser(userId);
      res.status(200).json({ success: true, data: groups });
    } catch (error) {
      sendError(res, error, "Failed to fetch groups");
    }
  };

  getGroupMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const groupId = req.params["groupId"] as string;
      const messages = await this.groupService.getGroupMessages(groupId, userId);

      const formattedMessages = messages.map((msg) => {
        const raw = msg.toObject() as Record<string, unknown> & {
          senderId?: unknown;
        };
        const sender = raw.senderId;
        const isPopulatedSender =
          typeof sender === "object" && sender !== null;
        const senderRecord = isPopulatedSender
          ? (sender as { _id?: unknown; name?: string })
          : null;

        return {
          ...raw,
          senderId: senderRecord
            ? String(senderRecord._id ?? "")
            : String(sender ?? ""),
          senderName: senderRecord?.name,
        };
      });

      res.status(200).json({
        success: true,
        data: formattedMessages,
      });
    } catch (error) {
      sendError(res, error, "Failed to fetch group messages");
    }
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const requesterId = getUserId(req);
      const groupId = req.params["groupId"] as string;
      const { userId } = req.body as { userId: string };
      await this.groupService.addMember(groupId, requesterId, userId);
      setGroupRoomMembership(req, userId, groupId, true);
      res.status(200).json({ success: true, message: "Member added" });
    } catch (error) {
      sendError(res, error, "Failed to add member");
    }
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const requesterId = getUserId(req);
      const groupId = req.params["groupId"] as string;
      const { userId } = req.body as { userId: string };
      await this.groupService.removeMember(groupId, requesterId, userId);
      setGroupRoomMembership(req, userId, groupId, false);
      res.status(200).json({ success: true, message: "Member removed" });
    } catch (error) {
      sendError(res, error, "Failed to remove member");
    }
  };
}

export default GroupController;
