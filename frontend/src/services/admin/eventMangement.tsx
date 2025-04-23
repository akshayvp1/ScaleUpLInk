import { api } from '../../utils/axiosInterceptor';

// Ticket interface
interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

// Event interface (aligned with EventManagement component)
interface Event {
  id: string;
  mainBanner: string;
  title: string;
  type: string;
  userName: string;
  userImage?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  visibility: 'Public' | 'Private';
  venueName: string;
  city: string;
  venueAddress: string;
  tickets: Ticket[];
  ageRestriction: boolean;
  isPremium: boolean;
  status: 'pending' | 'approve' | 'cancelled' | 'completed';
}

interface RawEventProps {
    _id: string;
    eventTitle: string;
    eventType: string;
    eventVisibility: 'Public' | 'Private';
    startDate: string;
    startTime: string;
    endingDate: string;
    endingTime: string;
    venueName: string;
    venueAddress: string;
    city: string;
    tickets: Ticket[];
    ageRestriction: boolean;
    mainBanner: string;
    promotionalImage?: string;
    attendees: number;
    createdAt: string;
    updatedAt: string;
    eventStatus: 'pending' | 'approve' | 'cancelled' | 'completed';
  
    user_id: {
      _id: string;
      name: string;
      image?: string;
    };
  }
  

const eventManagement = {
  // Fetch all events and map to Event interface
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await api.admin.get('/events');
      // Validate response structure
      if (!response.data) {
        throw new Error('No data received from API');
      }
      // Handle different possible response structures
      const rawEvents: RawEventProps[] = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (rawEvents.length === 0) {
        console.warn('No events found in response');
      }
      return rawEvents.map((event) => ({
        id: event._id,
        mainBanner: event.mainBanner || '/api/placeholder/640/360',
        title: event.eventTitle || 'Untitled Event',
        type: event.eventType || 'Unknown',
        userName: event.user_id?.name || 'Anonymous',
        userImage: event.user_id?.image || '/api/placeholder/40/40',
        startDate: event.startDate,
        startTime: event.startTime || '00:00',
        endDate: event.endingDate,
        endTime: event.endingTime || '00:00',
        visibility: event.eventVisibility || 'Public',
        venueName: event.venueName || 'Unknown Venue',
        city: event.city || 'Unknown',
        venueAddress: event.venueAddress || '',
        tickets: event.tickets,
        ageRestriction: event.ageRestriction,
        isPremium: false, // or derive based on your logic
        status: event.eventStatus,
      }));
      
    } catch (error) {
      console.error('Error fetching events:', error, {
       
      });
      throw error;
    }
  },

  // Approve an event
  async approveEvent(eventId: string): Promise<void> {
    try {
      await api.admin.patch(`/events/${eventId}/approve`);
    } catch (error) {
      console.error(`Error approving event ${eventId}:`, error);
      throw error;
    }
  },

  // Unapprove an event
  async unapproveEvent(eventId: string): Promise<void> {
    try {
      await api.admin.patch(`/events/${eventId}/unapprove`);
    } catch (error) {
      console.error(`Error unapproving event ${eventId}:`, error);
      throw error;
    }
  },
};

export default eventManagement;