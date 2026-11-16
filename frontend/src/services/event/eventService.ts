import { api } from "../../utils/axiosInterceptor";
import { IEventService, EventFormData, EventResponse } from '../../types/event/event.types';
import seatService from '../seat/seatServics';

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

// Converts a ticket index into a row letter: 0 -> "A", 1 -> "B", ... 25 -> "Z",
// 26 -> "AA", etc. — in case there are ever more than 26 ticket types.
const rowLetterForIndex = (index: number): string => {
  let n = index;
  let label = '';
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
};

class EventService implements IEventService {
  async createEvent(eventData: EventFormData): Promise<EventResponse> {
    try {
      console.log(eventData, "Creating event data");
      const formattedData = {
        ...eventData,
        tickets: eventData.tickets.map((ticket) => ({
          type: ticket.type,
          price: ticket.price,
          quantity: ticket.quantity,
        })),
      };

      const response = await api.shared.post<EventResponse>('/event-creation', formattedData);
      console.log('[createEvent] raw response:', response.data); // TEMP — confirm shape, then remove

      const newEventId = this.extractEventId(response.data);

      if (newEventId) {
        // Each ticket type becomes its own "row" in the seat map:
        // quantity -> seat count, type -> category, price carries over.
        const rows = eventData.tickets
          .filter((t) => t.quantity > 0) // skip ticket types with 0 quantity
          .map((ticket, index) => ({
            row: rowLetterForIndex(index),
            count: ticket.quantity,
            category: ticket.type,
            price: ticket.price,
          }));

        if (rows.length > 0) {
          try {
            await seatService.generateSeatsForEvent(newEventId, rows);
          } catch (seatError) {
            // Don't fail the whole event-creation flow if seat generation
            // hiccups — the event itself was already created successfully.
            console.error("Event created, but seat generation failed:", seatError);
          }
        }
      } else {
        console.warn("Could not determine new event ID from response — seats were not generated.");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  // Adjust this if your actual response shape differs from all four guesses below.
  // Log response.data from createEvent once to confirm, then simplify this
  // to the single correct path (e.g. `data.data._id`).
  private extractEventId(data: unknown): string | null {
    const payload = data as {
      data?: { _id?: string; id?: string };
      _id?: string;
      id?: string;
    } | null;
    return (
      payload?.data?._id || payload?.data?.id || payload?._id || payload?.id || null
    );
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
      console.log(response, "daaaa");
      return { ...response.data.data, tickets: response.data.data.tickets || [] };
    } catch (error) {
      console.error(`Error fetching event by ID ${id}:`, error);
      throw error;
    }
  }

  async shareEventToUsers(
    eventId: string,
    userIds: string[]
  ): Promise<{ sharedCount: number }> {
    const response = await api.shared.post<{
      success: boolean;
      sharedCount?: number;
      message?: string;
    }>(`/events/${eventId}/share-to-users`, { userIds });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to share event");
    }

    return { sharedCount: response.data.sharedCount ?? 0 };
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