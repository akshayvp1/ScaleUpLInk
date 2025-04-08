
// Ticket definition
export interface Ticket {
    id?: number; // Used locally for React state management
    type: string;
    price: number;
    quantity: number;
  }
  
  // Full Event model as stored in database
  export interface Event {
    id?: string; // MongoDB _id when fetched from backend
    user_id?: string;
    eventTitle: string;
    eventDescription: string;
    eventType: 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party';
    startDate: Date;
    startTime: string;
    endingDate: Date;
    endingTime?: string;
    eventVisibility: 'Public' | 'Private';
    venueName: string;
    venueAddress?: string;
    city: string;
    tickets: Ticket[];
    ageRestriction: boolean;
    mainBanner: string;
    promotionalImage?: string;
    createdAt?: string;
    updatedAt?: string;
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