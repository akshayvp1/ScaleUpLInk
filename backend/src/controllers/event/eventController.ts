// controllers/event/eventController.ts
import { injectable, inject } from "tsyringe";
import IEventController from "./interface/IEventController";
import EventService from "../../services/event/eventService";
import { Request, Response } from "express";
import { ICreateEventDTO, RawEventProps } from "../../interfaces/IEvent";

@injectable()
class EventController implements IEventController {
  private eventService: EventService;

  constructor(@inject("EventService") eventService: EventService) {
    this.eventService = eventService;
  }

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: ICreateEventDTO = req.body;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        res.status(401).json({ message: "Unauthorized: User ID missing" });
        return;
      }

      const event = await this.eventService.createEvent(currentUserId, data);
      res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
      console.error("Error in Controller:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  };

  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user
        console.log(user,"dddd")
      const events: RawEventProps[] = await this.eventService.getAllEvents();
      res.status(200).json({
        success: true,
        data: events,
        message: 'Events fetched successfully'
      });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }
  getEventsById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; 
      if (!id) {
        res.status(400).json({ success: false, message: "Event ID is required", data: null });
        return;
      }

      const event = await this.eventService.getEventsById(id as string);
      

      res.status(200).json({
        success: true,
        data: event,
        message: "Event fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        data: null,
      });
    }
  };
}

export default EventController;