import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IChatService } from "../../services/chat/interface/IChatService";
import { IChatController } from "./interface/IChatController";

@injectable()
class ChatController implements IChatController {
  constructor(
    @inject("ChatService")
    private chatService: IChatService
  ) {}

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = req.user?.id;

      if (!senderId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const receiverId = String(req.params.receiverId);

      if (!Types.ObjectId.isValid(receiverId)) {
        res.status(400).json({
          success: false,
          message: "Invalid receiver id",
        });
        return;
      }

      const messages = await this.chatService.getMessages(senderId, receiverId);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error("GET MESSAGES ERROR:", error);

      const message = error instanceof Error ? error.message : "";

      res.status(message === "NOT_CONNECTED" ? 403 : 500).json({
        success: false,
        message:
          message === "NOT_CONNECTED"
            ? "You can only message people you are connected with."
            : "Failed to fetch messages",
      });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const users = await this.chatService.getUsers(userId);

      return res.status(200).json({ success: true, users });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  };
}

export default ChatController;
