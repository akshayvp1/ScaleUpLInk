// // repositories/event/eventRepository.ts
// import { injectable, inject } from "tsyringe";
// import IEventRepository from "./interface/IEventRepository";
// import { EventModel } from "../../models/eventModel";
// import { ICreateEventDTO, EventDocument } from "../../interfaces/IEvent";
// import { RawEventProps } from "../../interfaces/IEvent";

// @injectable()
// class EventRepository implements IEventRepository {
//   constructor(@inject("EventModel") private readonly eventModel: typeof EventModel) {}

//   async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
//     try {
//       const event = new this.eventModel({
//         ...data,
//         user_id: currentUserId,
//       });
//       return await event.save();
//     } catch (error) {
//       console.error("Error in Repository:", error);
//       throw error;
//     }
//   }

//   async getAllEvents(): Promise<RawEventProps[]> {
//     try {
//       const events = await this.eventModel.find({}).exec();
      
//       return events.map((event: EventDocument) => ({
//         id: event._id.toString(), 
//         title: event.eventTitle,
//         description: event.eventDescription,
//         type: event.eventType,
//         startDate: event.startDate.toISOString(),
//         startTime: event.startTime,
//         endingDate: event.endingDate.toISOString(),
//         endingTime: event.endingTime || '',
//         venueName: event.venueName,
//         city: event.city,
//         ticketPrice: event.tickets[0]?.price || 0,
//         ageRestriction: event.ageRestriction,
//         mainBanner: event.mainBanner,
//         attendees: 0, 
//       }));
//     } catch (error) {
//       throw new Error(`Failed to fetch events from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async getEventsById(eventId:string):Promise<void>{
//     try{
//     const event = await this.eventModel.findOne({eventId})
//     return event
//     }catch(error){
//         console.log(error)
//     }
//   }
// }

// export default EventRepository;




// repositories/event/eventRepository.ts
import { injectable, inject } from "tsyringe";
import IEventRepository from "./interface/IEventRepository";
import { EventModel } from "../../models/eventModel";
import { ICreateEventDTO, EventDocument } from "../../interfaces/IEvent";
import { RawEventProps } from "../../interfaces/IEvent";

@injectable()
class EventRepository implements IEventRepository {
  constructor(@inject("EventModel") private readonly eventModel: typeof EventModel) {}

  async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
    try {
      const event = new this.eventModel({
        ...data,
        user_id: currentUserId,
      });
      return await event.save();
    } catch (error) {
      console.error("Error in Repository:", error);
      throw error;
    }
  }

  async getAllEvents(): Promise<RawEventProps[]> {
    try {
      const events = await this.eventModel.find({}).exec();
      
      return events.map((event: EventDocument) => ({
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
        attendees: 0, // Adjust if you have this data
      }));
    } catch (error) {
      throw new Error(`Failed to fetch events from database: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getEventsById(eventId: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel.findById(eventId).exec(); // Use findById for MongoDB _id
      return event;
    } catch (error) {
      console.error(`Repository error fetching event by ID ${eventId}:`, error);
      throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export default EventRepository;