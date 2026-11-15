import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import EventService from "../../services/event/eventService";
import { RawEventProps } from "../../interfaces/IEvent";
import IEventController from "./interface/IEventController";

@injectable()
class EventController implements IEventController {
  constructor(@inject("EventService") private eventService: EventService) {}

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
