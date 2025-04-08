// // services/event/eventService.ts
// import { inject, injectable } from "tsyringe";
// import IEventService from "./interface/IEventService";
// import EventRepository from "../../repositories/event/eventRepository";
// import { ICreateEventDTO, EventDocument } from "../../interfaces/IEvent";
// import { RawEventProps } from '../../interfaces/IEvent';

// @injectable()
// class EventService implements IEventService {
//   constructor(@inject("EventRepository") private eventRepository: EventRepository) {}

//   async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
//     try {
//       return await this.eventRepository.createEvent(currentUserId, data);
//     } catch (error) {
//       console.error("Error in Service:", error);
//       throw error;
//     }
//   }

//   async getAllEvents(): Promise<RawEventProps[]> {
//     try {
//       return await this.eventRepository.getAllEvents();
//     } catch (error) {
//       throw new Error(`Service error fetching events: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async getEventsById(eventId:string):Promise<void>{
//     try{
//     return await this.eventRepository.getEventsById(eventId)
//     }catch(error){
//         console.log(error)
//     }
//   }
// }

// export default EventService;




// services/event/eventService.ts
import { inject, injectable } from "tsyringe";
import IEventService from "./interface/IEventService";
import EventRepository from "../../repositories/event/eventRepository";
import { ICreateEventDTO, EventDocument, RawEventProps } from "../../interfaces/IEvent";

@injectable()
class EventService implements IEventService {
  constructor(@inject("EventRepository") private eventRepository: EventRepository) {}

  async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
    try {
      return await this.eventRepository.createEvent(currentUserId, data);
    } catch (error) {
      console.error("Error in Service:", error);
      throw error;
    }
  }

  async getAllEvents(): Promise<RawEventProps[]> {
    try {
      return await this.eventRepository.getAllEvents();
    } catch (error) {
      throw new Error(`Service error fetching events: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getEventsById(eventId: string): Promise<RawEventProps | null> {
    try {
      const event = await this.eventRepository.getEventsById(eventId);
      if (!event) return null;

      // Transform EventDocument to RawEventProps
      return {
        id: event._id.toString(),
        title: event.eventTitle,
        description: event.eventDescription,
        type: event.eventType,
        startDate: event.startDate.toISOString(),
        startTime: event.startTime,
        endingDate: event.endingDate.toISOString(),
        endingTime: event.endingTime || "",
        venueName: event.venueName,
        city: event.city,
        ticketPrice: event.tickets[0]?.price || 0,
        ageRestriction: event.ageRestriction,
        mainBanner: event.mainBanner,
        attendees: 0,
      };
    } catch (error) {
      console.error(`Service error fetching event by ID ${eventId}:`, error);
      throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export default EventService;