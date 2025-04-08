// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
// import { Badge } from '../../components/ui/badge';
// import { Button } from '../../components/ui/button';
// import { Calendar, Clock, MapPin, Plus, Ticket, Users } from 'lucide-react';
// import { format } from 'date-fns';
// import { useNavigate, useLocation } from 'react-router-dom';
// import eventService from '../../services/event/eventService'; // Updated path

// // Interface for event data as expected by the component
// interface EventProps {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   startDate: Date;
//   startTime: string;
//   endingDate: Date;
//   endingTime: string;
//   venueName: string;
//   city: string;
//   ticketPrice: number;
//   ageRestriction: boolean;
//   mainBanner: string;
//   attendees: number;
// }

// // Interface for raw API response
// interface RawEventProps {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   startDate: string;
//   startTime: string;
//   endingDate: string;
//   endingTime: string;
//   venueName: string;
//   city: string;
//   ticketPrice: number;
//   ageRestriction: boolean;
//   mainBanner: string;
//   attendees: number;
// }

// const EventCard: React.FC<EventProps> = ({
//   id,
//   title,
//   description,
//   type,
//   startDate,
//   startTime,
//   endingDate,
//   venueName,
//   city,
//   ticketPrice,
//   ageRestriction,
//   mainBanner,
//   attendees
// }) => {
//   return (
//     <Card className="overflow-hidden transition-all hover:shadow-md">
//       <div className="relative h-40 w-full overflow-hidden">
//         <div
//           className="h-full w-full bg-cover bg-center"
//           style={{
//             backgroundImage: mainBanner ? 
//               `url(${mainBanner})` : 
//               "url('/api/placeholder/800/400')"
//           }}
//         />
//         <div className="absolute top-3 right-3">
//           <Badge variant="secondary" className="font-medium text-xs">
//             {type}
//           </Badge>
//         </div>
//         {ageRestriction && (
//           <div className="absolute top-3 left-3">
//             <Badge variant="destructive" className="font-medium text-xs">
//               18+
//             </Badge>
//           </div>
//         )}
//       </div>

//       <CardHeader className="pb-1 pt-3">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-base font-bold line-clamp-1">{title}</h3>
//             <p className="text-muted-foreground text-xs flex items-center mt-1">
//               <Calendar className="h-3 w-3 mr-1" />
//               {format(startDate, 'EEE, MMM d, yyyy')}
//             </p>
//           </div>
//           <Badge variant="outline" className="flex items-center gap-1 text-xs">
//             <Ticket className="h-3 w-3" />
//             ${ticketPrice}
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="pb-3 pt-0">
//         <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{description}</p>

//         <div className="space-y-1 text-xs">
//           <div className="flex items-center text-muted-foreground">
//             <Clock className="h-3 w-3 mr-2" />
//             <span>{startTime}</span>
//           </div>
//           <div className="flex items-center text-muted-foreground">
//             <MapPin className="h-3 w-3 mr-2" />
//             <span className="truncate">{venueName}, {city}</span>
//           </div>
//           <div className="flex items-center text-muted-foreground">
//             <Users className="h-3 w-3 mr-2" />
//             <span>{attendees} attending</span>
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="bg-muted/50 pt-2 pb-2">
//         <div className="flex w-full justify-between items-center">
//           <Button variant="ghost" size="sm" className="text-xs px-2 h-8">
//             Share
//           </Button>
//           <Button size="sm" className="text-xs px-3 h-8">View Details</Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export const EventGallery: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [events, setEvents] = useState<EventProps[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         setIsLoading(true);
//         const fetchedEvents: RawEventProps[] = await eventService.getAllEvents();
//         console.log('Fetched Events:', fetchedEvents);

//         const formattedEvents: EventProps[] = fetchedEvents.map((event: RawEventProps) => ({
//           id: event.id,
//           title: event.title,
//           description: event.description,
//           type: event.type,
//           startDate: new Date(event.startDate),
//           startTime: event.startTime || 'N/A',
//           endingDate: new Date(event.endingDate),
//           endingTime: event.endingTime || 'N/A',
//           venueName: event.venueName || 'TBD',
//           city: event.city || 'Unknown',
//           ticketPrice: event.ticketPrice || 0,
//           ageRestriction: event.ageRestriction || false,
//           mainBanner: event.mainBanner || '',
//           attendees: event.attendees || 0
//         }));
//         setEvents(formattedEvents);
//       } catch (err) {
//         setError('Failed to fetch events. Please try again later.');
//         console.error('Error fetching events:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const handleCreateEvent = () => {
//     console.log('Current location:', location.pathname);
//     console.log('Navigating to: /mainpage/dashboard/event-create');
//     navigate('/mainpage/dashboard/event-create');
//   };

//   if (isLoading) {
//     return (
//       <div className="w-full max-w-7xl mx-auto p-4">
//         <p>Loading events...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="w-full max-w-7xl mx-auto p-4">
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-7xl mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-bold">Upcoming Events</h2>
//         <Button 
//           className="bg-primary hover:bg-primary/90 flex items-center gap-2"
//           onClick={handleCreateEvent}
//         >
//           <Plus className="h-4 w-4" />
//           Create Event
//         </Button>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {events.map(event => (
//           <EventCard key={event.id} {...event} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EventGallery;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, MapPin, Plus, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import eventService from '../../services/event/eventService';
import EventModal from '../../components/basics/EventModal';
import toast from 'react-hot-toast';

// Interface for ticket (consistent with EventModal and event.types.ts)
interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

// Interface for event data (aligned with EventModal and event.types.ts)
export interface EventProps {
  id?: string;
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
  attendees: number;
}

// Interface for raw API response (aligned with EventService.ts and event.types.ts)
interface RawEventProps {
  id: string;
  title: string;
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
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  attendees: number;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventCardProps extends EventProps {
  onViewDetails: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  eventTitle,
  eventDescription,
  eventType,
  startDate,
  startTime,
  venueName,
  city,
  tickets,
  ageRestriction,
  mainBanner,
  attendees,
  onViewDetails,
}) => {
  // Calculate the minimum ticket price from the tickets array
  const minTicketPrice = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: mainBanner ? `url(${mainBanner})` : "url('/api/placeholder/800/400')",
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-medium text-xs">
            {eventType}
          </Badge>
        </div>
        {ageRestriction && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="font-medium text-xs">
              18+
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-1 pt-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold line-clamp-1">{eventTitle}</h3>
            <p className="text-muted-foreground text-xs flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {format(startDate, 'EEE, MMM d, yyyy')}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Ticket className="h-3 w-3" />
            {tickets.length > 0 ? `From $${minTicketPrice}` : 'Free'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{eventDescription}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-2" />
            <span>{startTime}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-3 w-3 mr-2" />
            <span className="truncate">{venueName}, {city}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-3 w-3 mr-2" />
            <span>{attendees} attending</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 pt-2 pb-2">
        <div className="flex w-full justify-between items-center">
          <Button variant="ghost" size="sm" className="text-xs px-2 h-8">
            Share
          </Button>
          <Button
            size="sm"
            className="text-xs px-3 h-8"
            onClick={() => onViewDetails(id || '')}
            disabled={!id}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export const EventGallery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState<EventProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const fetchedEvents: RawEventProps[] = await eventService.getAllEvents();
        console.log('Fetched Events:', fetchedEvents);

        const formattedEvents: EventProps[] = fetchedEvents.map((event: RawEventProps) => ({
          id: event.id,
          user_id: event.user_id,
          eventTitle: event.title,
          eventDescription: event.description,
          eventType: event.type as 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party',
          startDate: new Date(event.startDate),
          startTime: event.startTime || 'N/A',
          endingDate: new Date(event.endingDate),
          endingTime: event.endingTime || 'N/A',
          eventVisibility: event.eventVisibility || 'Public', // Fallback if not provided
          venueName: event.venueName || 'TBD',
          venueAddress: event.venueAddress,
          city: event.city || 'Unknown',
          tickets: event.tickets || [], // Use empty array if tickets are missing
          ageRestriction: event.ageRestriction || false,
          mainBanner: event.mainBanner || '',
          promotionalImage: event.promotionalImage,
          attendees: event.attendees || 0,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewDetails = async (id: string) => {
    try {
      const eventDetails: RawEventProps = await eventService.getEventById(id);
      const formattedEvent: EventProps = {
        id: eventDetails.id,
        user_id: eventDetails.user_id,
        eventTitle: eventDetails.title,
        eventDescription: eventDetails.description,
        eventType: eventDetails.type as 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party',
        startDate: new Date(eventDetails.startDate),
        startTime: eventDetails.startTime || 'N/A',
        endingDate: new Date(eventDetails.endingDate),
        endingTime: eventDetails.endingTime || 'N/A',
        eventVisibility: eventDetails.eventVisibility || 'Public',
        venueName: eventDetails.venueName || 'TBD',
        venueAddress: eventDetails.venueAddress,
        city: eventDetails.city || 'Unknown',
        tickets: eventDetails.tickets || [],
        ageRestriction: eventDetails.ageRestriction || false,
        mainBanner: eventDetails.mainBanner || '',
        promotionalImage: eventDetails.promotionalImage,
        attendees: eventDetails.attendees || 0,
        createdAt: eventDetails.createdAt,
        updatedAt: eventDetails.updatedAt,
      };
      setSelectedEvent(formattedEvent);
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Error fetching event details for ID ${id}:`, error);
      toast.error('Failed to load event details. Please try again.');
    }
  };

  const handleApply = (eventId: string, ticketType: string) => {
    console.log(`Applying for event ${eventId} with ticket type: ${ticketType}`);
    toast.success(`Applied for ${ticketType} ticket successfully!`);
    setIsModalOpen(false);
  };

  const handleCreateEvent = () => {
    console.log('Current location:', location.pathname);
    console.log('Navigating to: /mainpage/dashboard/event-create');
    navigate('/mainpage/dashboard/event-create');
  };

  if (isLoading) {
    return <div className="w-full max-w-7xl mx-auto p-4">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upcoming Events</h2>
        <Button
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          onClick={handleCreateEvent}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {events.map(event => (
          <EventCard key={event.id} {...event} onViewDetails={handleViewDetails} />
        ))}
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
};

export default EventGallery;