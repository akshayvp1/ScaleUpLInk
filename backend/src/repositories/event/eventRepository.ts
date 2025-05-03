import { injectable, inject } from 'tsyringe';
import IEventRepository from './interface/IEventRepository';
import { EventModel } from '../../models/eventModel';
import { ICreateEventDTO, EventDocument, RawEventProps } from '../../interfaces/IEvent';
import { BookingsModel } from '../../models/bookingModel';
@injectable()
class EventRepository implements IEventRepository {
  constructor(
    @inject('EventModel') private readonly eventModel: typeof EventModel,
    @inject('BookingsModel') private readonly bookingsModel: typeof BookingsModel
  ) {}

  async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
    try {
      const event = new this.eventModel({
        ...data,
        user_id: currentUserId,
      });
      return await event.save();
    } catch (error) {
      console.error('Repository Error creating event:', error);
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  async getAllEvents(): Promise<RawEventProps[]> {
    try {
      // Fetch only events with status 'approve' and populate user details
      const events = await this.eventModel
        .find({ eventStatus: 'approve' })
        .populate('user_id', 'name profileImage') // Populate user name and image only
        .exec();
  
      return events.map((event: EventDocument & { user_id: any }) => ({
        id: event._id.toString(),
        user_id: event.user_id._id.toString(),
        userName: event.user_id.name,                  
        userImage: event.user_id.profileImage,          
        title: event.eventTitle,
        description: event.eventDescription,
        type: event.eventType,
        startDate: event.startDate.toISOString(),
        startTime: event.startTime,
        endingDate: event.endingDate.toISOString(),
        endingTime: event.endingTime || '',
        eventVisibility: event.eventVisibility,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        city: event.city,
        tickets: event.tickets,
        ageRestriction: event.ageRestriction,
        mainBanner: event.mainBanner,
        promotionalImage: event.promotionalImage,
        attendees: event.attendees,
        createdAt: event.createdAt?.toISOString(),
        updatedAt: event.updatedAt?.toISOString(),
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getPaidEvents(userId:string): Promise<EventDocument[]> {
    try {
      const paidBookings = await this.bookingsModel.find({ paymentStatus: 'paid',userId:userId}).select('eventId');
      console.log(paidBookings,"paid bookings 🌳")
      const eventIds = [...new Set(paidBookings.map(booking => booking.eventId.toString()))];
      console.log(eventIds,"event ids 💕")
      const events = await this.eventModel.find({ _id: { $in: eventIds } });
     console.log(events,"❤️❤️")
      return events;
    } catch (error) {
      console.error('Error fetching paid events:', error);
      throw error;
    }
  }
  async createdEvents(userId:string):Promise<EventDocument[]>{
    try{
     const events = await this.eventModel.find({user_id:userId})
     
     return events
    }catch(error){
      console.log(error)
      throw error;
    }
  }
  
  
  async getEventsById(eventId: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel
        .findById(eventId)
        .populate('user_id', 'name profileImage') 
        .exec();
  
      return event;
    } catch (error) {
      console.error(`Repository Error fetching event by ID ${eventId}:`, error);
      throw new Error(
        `Failed to fetch event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }




  
}

export default EventRepository;




// // backend/src/repositories/event/EventRepository.ts
// import { injectable, inject } from "tsyringe";
// import IEventRepository from "./interface/IEventRepository";
// import { EventModel } from "../../models/eventModel";
// import { ICreateEventDTO, EventDocument, RawEventProps } from "../../interfaces/IEvent";
// import mongoose, { ClientSession } from "mongoose";

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
//     } catch (error: unknown) {
//       console.error("Repository Error creating event:", error);
//       throw new Error(`Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async getAllEvents(): Promise<RawEventProps[]> {
//     try {
//       const events = await this.eventModel
//         .find({ eventStatus: "approve" })
//         .populate("user_id", "name profileImage")
//         .exec();

//       return events.map((event: EventDocument & { user_id: any }) => ({
//         id: event._id.toString(),
//         user_id: event.user_id._id.toString(),
//         userName: event.user_id.name,
//         userImage: event.user_id.profileImage,
//         title: event.eventTitle,
//         description: event.eventDescription,
//         type: event.eventType,
//         startDate: event.startDate.toISOString(),
//         startTime: event.startTime,
//         endingDate: event.endingDate.toISOString(),
//         endingTime: event.endingTime || "",
//         eventVisibility: event.eventVisibility,
//         venueName: event.venueName,
//         venueAddress: event.venueAddress,
//         city: event.city,
//         tickets: event.tickets,
//         ageRestriction: event.ageRestriction,
//         mainBanner: event.mainBanner,
//         promotionalImage: event.promotionalImage,
//         attendees: event.attendees,
//         createdAt: event.createdAt?.toISOString(),
//         updatedAt: event.updatedAt?.toISOString(),
//       }));
//     } catch (error: unknown) {
//       throw new Error(
//         `Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   }

//   async getEventsById(eventId: string): Promise<EventDocument | null> {
//     try {
//       const event = await this.eventModel
//         .findById(eventId)
//         .populate("user_id", "name profileImage")
//         .exec();
//       return event;
//     } catch (error: unknown) {
//       console.error(`Repository Error fetching event by ID ${eventId}:`, error);
//       throw new Error(
//         `Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   }

//   async update(
//     eventId: string | mongoose.Types.ObjectId,
//     update: Partial<EventDocument>,
//     session?: ClientSession
//   ): Promise<EventDocument | null> {
//     try {
//       const options = session ? { session, new: true } : { new: true };
//       const event = await this.eventModel
//         .findByIdAndUpdate(eventId, { $set: update }, options)
//         .exec();
//       return event;
//     } catch (error: unknown) {
//       console.error(`Repository Error updating event ${eventId}:`, error);
//       throw new Error(
//         `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   }

//   async cancelEvent(eventId: string): Promise<void> {
//     try {
//       await this.eventModel
//         .findByIdAndUpdate(eventId, { $set: { eventStatus: "cancelled" } }, { new: true })
//         .exec();
//     } catch (error: unknown) {
//       console.error(`Repository Error cancelling event ${eventId}:`, error);
//       throw new Error(
//         `Failed to cancel event: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   }
// }

// export default EventRepository;