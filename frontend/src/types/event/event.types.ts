
// Ticket definition
export interface Ticket {
    id?: number; // Used locally for React state management
    type: string;
    price: number;
    quantity: number;
  }
  
  // Full Event model as stored in database
  interface Event {
    id: string;
    mainBanner: string;
    eventTitle: string; // Use backend field name
    eventType: string;
    userName: string; // Not provided by backend
    userImage?: string; // Not provided by backend
    startDate: Date;
    startTime: string;
    endingDate: Date; // Use backend field name
    endingTime: string; // Use backend field name
    eventVisibility: 'Public' | 'Private'; // Use backend field name
    venueName: string;
    city: string;
    venueAddress: string;
    tickets: Ticket[];
    ageRestriction: boolean;
    isPremium: boolean; // Not in backend
    eventStatus: 'pending' | 'approve' | 'cancelled' | 'completed'; // Use backend field name
  }
  
  // Form data structure for creating events
  export interface EventFormData {
    eventTitle: string;
    eventDescription: string;
    eventType: string;
    startDate: Date;
    startTime: string;
    endingDate: Date;
    endingTime: string;
    eventVisibility: 'Public' | 'Private';
    venueName: string;
    venueAddress: string;
    city: string;
    tickets: Ticket[];
    ageRestriction: boolean;
    mainBanner: string;
    promotionalImage: string;
  }
  
  interface RawEventProps {
    id: string;
    title: string;
    description: string;
    type: string;
    startDate: string;
    startTime: string;
    endingDate: string;
    endingTime: string;
    eventVisibility: 'Public' | 'Private'; // Added in frontend
    venueName: string;
    venueAddress?: string; // Added in frontend
    city: string;
    tickets: Ticket[]; // Changed from ticketPrice
    ageRestriction: boolean;
    mainBanner: string;
    promotionalImage?: string; // Added in frontend
    attendees: number;
    user_id?: string; // Added in frontend
    createdAt?: string; // Added in frontend
    updatedAt?: string; // Added in frontend
  }

  
  // API response for event creation
  export interface EventResponse extends Event {
    // Any additional fields specific to the response
    // that aren't in the base Event interface
  }
  
  // Event service interface
  export interface IEventService {
    createEvent(eventData: EventFormData): Promise<EventResponse>;
    getAllEvents(): Promise<RawEventProps[]> 
    // Add other event-related methods as needed
    // getEvents(): Promise<Event[]>;
    // getEventById(id: string): Promise<Event>;
    // updateEvent(id: string, eventData: Partial<EventFormData>): Promise<EventResponse>;
    // deleteEvent(id: string): Promise<boolean>;
  }