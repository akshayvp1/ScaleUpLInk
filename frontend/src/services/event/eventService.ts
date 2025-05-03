
import { api } from "../../utils/axiosInterceptor";
import { IEventService, EventFormData, EventResponse, } from '../../types/event/event.types';

interface ApiEventResponse {
  success: boolean;
  data: RawEventProps[];
  message: string;
}

export interface RawEventProps {
  id: string;
  title: string;
  userName: string;
  userImage: string;
  description: string;
  type: string;
  startDate: string;
  startTime: string;
  endingDate: string;
  endingTime: string;
  eventVisibility: 'Public' | 'Private';
  venueName: string;
  venueAddress?: string;
  city: string;
  tickets: { type: string; price: number; quantity: number }[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  attendees: number;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

class EventService implements IEventService {
  async createEvent(eventData: EventFormData): Promise<EventResponse> {
    try {
      console.log(eventData, "Creating event data");
      const formattedData = {
        ...eventData,
        tickets: eventData.tickets.map(({ id, ...rest }) => rest), 
      };
      const response = await api.shared.post<EventResponse>('/event-creation', formattedData);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async getAllEvents(): Promise<RawEventProps[]> {
    try {
      const response = await api.shared.get<ApiEventResponse>('/get-events');
      console.log(response, "Fetched events");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }
  
  async getEventById(id: string): Promise<RawEventProps> {
    try {
      const response = await api.shared.get<{ success: boolean; data: RawEventProps; message: string }>(`/events/${id}`);
      console.log(response,"daaaa")
      return { ...response.data.data, tickets: response.data.data.tickets || [] };
    } catch (error) {
      console.error(`Error fetching event by ID ${id}:`, error);
      throw error;
    }
  }
  async getPaidEvents(): Promise<RawEventProps[]> {
    try {
      const response = await api.shared.get<ApiEventResponse>('/paid-events');
      console.log(response, "Fetched paid events");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching paid events:", error);
      throw error;
    }
  }

  async getCreatedByUserEvents(): Promise<RawEventProps[]> {
    try {
      const response = await api.shared.get<ApiEventResponse>('/created-by');
      console.log(response, "Fetched events created by user");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching events created by user:", error);
      throw error;
    }
  }

  async getCompletedEvents(): Promise<RawEventProps[]> {
    try {
      const response = await api.shared.get<ApiEventResponse>('/completed');
      console.log(response, "Fetched completed events");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching completed events:", error);
      throw error;
    }
  }
}

export default new EventService();