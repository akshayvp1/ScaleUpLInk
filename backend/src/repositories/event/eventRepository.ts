import { injectable, inject } from 'tsyringe';
import IEventRepository from './interface/IEventRepository';
import { EventModel } from '../../models/eventModel';
import { ICreateEventDTO, EventDocument, RawEventProps } from '../../interfaces/IEvent';

@injectable()
class EventRepository implements IEventRepository {
  constructor(@inject('EventModel') private readonly eventModel: typeof EventModel) {}

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

  // async getAllEvents(): Promise<RawEventProps[]> {
  //   try {
  //     // Fetch only events with status 'approve'
  //     const events = await this.eventModel.find({ eventStatus: 'approve' }).exec();
  
  //     return events.map((event: EventDocument) => ({
  //       id: event._id.toString(),
  //       user_id: event.user_id.toString(),
  //       title: event.eventTitle,
  //       description: event.eventDescription,
  //       type: event.eventType,
  //       startDate: event.startDate.toISOString(),
  //       startTime: event.startTime,
  //       endingDate: event.endingDate.toISOString(),
  //       endingTime: event.endingTime || '',
  //       eventVisibility: event.eventVisibility,
  //       venueName: event.venueName,
  //       venueAddress: event.venueAddress,
  //       city: event.city,
  //       tickets: event.tickets,
  //       ageRestriction: event.ageRestriction,
  //       mainBanner: event.mainBanner,
  //       promotionalImage: event.promotionalImage,
  //       attendees: event.attendees,
  //       createdAt: event.createdAt?.toISOString(),
  //       updatedAt: event.updatedAt?.toISOString(),
  //     }));
  //   } catch (error) {
  //     throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // }
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
  
  

  async getEventsById(eventId: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel
        .findById(eventId)
        .populate('user_id', 'name profileImage') // 👈 populate only needed fields
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