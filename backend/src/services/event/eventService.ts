import { inject, injectable } from 'tsyringe';
import IEventService from './interface/IEventService';
import EventRepository from '../../repositories/event/eventRepository';
import { ICreateEventDTO, EventDocument, RawEventProps } from '../../interfaces/IEvent';

@injectable()
class EventService implements IEventService {
  constructor(@inject('EventRepository') private eventRepository: EventRepository) {}

  async createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> {
    try {
      return await this.eventRepository.createEvent(currentUserId, data);
    } catch (error) {
      console.error('Service Error creating event:', error);
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllEvents(): Promise<RawEventProps[]> {
    try {
      return await this.eventRepository.getAllEvents();
    } catch (error) {
      throw new Error(`Service Error fetching events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEventsById(eventId: string): Promise<RawEventProps | null> {
    try {
      const event = await this.eventRepository.getEventsById(eventId);
      if (!event) return null;

      return {
        id: event._id.toString(),
        user_id: event.user_id.toString(),
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
      };
    } catch (error) {
      console.error(`Service Error fetching event by ID ${eventId}:`, error);
      throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default EventService;