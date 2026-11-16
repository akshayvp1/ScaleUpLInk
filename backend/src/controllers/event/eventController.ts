import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { Server } from "socket.io";
import { Types } from "mongoose";
import EventService from "../../services/event/eventService";
import ChatService from "../../services/chat/chatService";
import { RawEventProps } from "../../interfaces/IEvent";
import IEventController from "./interface/IEventController";

@injectable()
class EventController implements IEventController {
  constructor(
    @inject("EventService") private eventService: EventService,
    @inject("ChatService") private chatService: ChatService
  ) {}

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const eventData = req.body;
      const event = await this.eventService.createEvent(currentUserId, eventData);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      this.handleError(res, error, next);
    }
  }

  async getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const re = req.user;
      console.log(re);

      const events: RawEventProps[] = await this.eventService.getAllEvents();
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      this.handleError(res, error, next);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.id;
      const event: RawEventProps | null = await this.eventService.getEventsById(eventId as string);
      if (!event) {
        res.status(404).json({ success: false, message: "Event not found" });
        return;
      }
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      this.handleError(res, error, next);
    }
  }
  async getPaidEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const events = await this.eventService.getPaidEvents(userId as string);
      
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error('Controller error in getPaidEvents:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  async createdEvents(req:Request,res:Response):Promise<void>{
    try{
     const userId = req.user?.id
     console.log(userId,"edoooooooo")
     const events = await this.eventService.createdEvents(userId as string)
     console.log(events,"🤣🤣🤣")
     res.status(200).json({ success: true, data: events });
    }catch(error){
      console.log(error)
    }
  }

  shareEventToUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = req.user?.id;
      const rawEventId = req.params.id;
      const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
      const { userIds } = req.body as { userIds?: string[] };

      if (!senderId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res.status(400).json({ success: false, message: "Invalid event id" });
        return;
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Select at least one person to share with",
        });
        return;
      }

      const uniqueUserIds = [
        ...new Set(
          userIds.filter(
            (id) =>
              typeof id === "string" &&
              id !== senderId &&
              Types.ObjectId.isValid(id)
          )
        ),
      ].slice(0, 50);

      if (uniqueUserIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Select at least one valid person to share with",
        });
        return;
      }

      const io = req.app.get("io") as Server | undefined;
      let sharedCount = 0;
      let lastError: unknown = null;

      for (const receiverId of uniqueUserIds) {
        try {
          const saved = await this.chatService.saveMessage(senderId, receiverId, {
            text: "",
            type: "event",
            eventId,
          });

          sharedCount += 1;

          if (!io) continue;

          const payload = {
            _id: saved._id.toString(),
            senderId,
            receiverId,
            text: saved.text,
            type: "event",
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

          io.to(receiverId).emit("receive_message", payload);
          io.to(senderId).emit("message_sent", payload);
        } catch (error) {
          lastError = error;
          if (
            !(error instanceof Error) ||
            error.message !== "NOT_CONNECTED"
          ) {
            console.error("Failed to share event in chat:", error);
          }
        }
      }

      if (sharedCount === 0) {
        const message =
          lastError instanceof Error &&
          lastError.message !== "NOT_CONNECTED" &&
          lastError.message !== ""
            ? lastError.message
            : "You can only share events with people you are connected with.";

        res.status(400).json({ success: false, message });
        return;
      }

      res.status(200).json({ success: true, sharedCount });
    } catch (error) {
      console.error("Error sharing event to users:", error);
      res.status(500).json({ success: false, message: "Failed to share event" });
    }
  };

  private handleError(res: Response, error: unknown, next: NextFunction): void {
    console.error("Controller Error:", error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
    next(error);
  }
}

export default EventController;
