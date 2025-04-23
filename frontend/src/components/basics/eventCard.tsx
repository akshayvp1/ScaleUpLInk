import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, MapPin, Plus, Ticket, Users, Heart, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import eventService from '../../services/event/eventService';
import EventModal from '../../components/basics/EventModal';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

export interface EventProps {
  id?: string;
  user_id?: string;
  eventTitle: string;
  userName: string;
  userImage: string;
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

// Interface for raw API response
interface RawEventProps {
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
  const [isLiked, setIsLiked] = useState(false);

  // Format date for display
  const eventDate = format(startDate, 'EEE, MMM d, yyyy');
  const dayNumber = format(startDate, 'd');
  const monthAbbr = format(startDate, 'MMM');

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl h-80 group cursor-pointer rounded-xl border-0 shadow-md">
      {/* Main image with overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
          style={{
            backgroundImage: mainBanner ? `url(${mainBanner})` : "url('/api/placeholder/800/400')",
          }}
        />
        {/* Gradient overlays - one for the bottom text and another for hover state */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-black/70 opacity-0 group-hover:opacity-90 transition-opacity duration-500"></div>
      </div>

      {/* Event Type Badge - always visible */}
      <div className="absolute top-4 right-4 z-20">
        <Badge variant="secondary" className="font-medium text-xs px-3 py-1 shadow-md bg-white text-black">
          {eventType}
        </Badge>
      </div>

      {/* Date Badge - Stylized date display */}
      <div className="absolute top-14 left-4 z-20 bg-white rounded-lg overflow-hidden shadow-lg group-hover:opacity-0 transition-opacity duration-300">
        <div className="w-16 h-16 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-gray-600 uppercase">{monthAbbr}</span>
          <span className="text-2xl font-bold text-gray-900">{dayNumber}</span>
        </div>
      </div>

      {/* Price Badge */}
      <div className="absolute top-14 right-4 z-20 group-hover:opacity-0 transition-opacity duration-300">
        <Badge variant="outline" className="bg-white text-black flex items-center gap-1 text-xs px-3 py-1 shadow-md">
          <Ticket className="h-3 w-3" />
          {tickets.length > 0 ? `From ₹${minTicketPrice}` : 'Free Entry'}
        </Badge>
      </div>

      {/* Basic info - always visible at bottom */}
      <div className="absolute bottom-6 left-4 right-4 z-20 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-xl font-bold text-white line-clamp-1 mb-1">{eventTitle}</h3>
        <div className="flex items-center text-white/80 text-sm gap-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{city}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{attendees} attending</span>
          </div>
        </div>
      </div>

      {/* Detailed info - visible only on hover */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none group-hover:pointer-events-auto">
        <div>
          <div className="flex flex-col items-start mb-3">
            <h3 className="text-2xl font-bold text-white mb-2">{eventTitle}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-white/90 text-black flex items-center gap-1 text-xs px-2 py-1">
                <Ticket className="h-3 w-3" />
                {tickets.length > 0 ? `From ₹${minTicketPrice}` : 'Free Entry'}
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {eventType}
              </Badge>
              {ageRestriction && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  18+
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-white/90 line-clamp-3 mb-4">{eventDescription}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm text-white/90 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{eventDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{startTime}</span>
            </div>
            <div className="flex items-center col-span-2">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="truncate">{venueName}, {city}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>{attendees} attending</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs px-3 h-9 text-black border-white/30 hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Share event:', id);
                toast.success('Share link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs px-3 h-9 ${isLiked ? 'text-red-400 border-red-400' : 'text-black border-white/30 hover:bg-white/20'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
                toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
              }}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-400' : ''}`} />
              {isLiked ? 'Saved' : 'Save'}
            </Button>
          </div>
          <Button
            size="sm"
            className="text-xs px-4 h-9 bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              id && onViewDetails(id);
            }}
            disabled={!id}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Clickable overlay for the entire card */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => id && onViewDetails(id)} 
      ></div>
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
          userName: event.userName || 'Event Host',
          userImage: event.userImage || '',
          eventTitle: event.title,
          eventDescription: event.description,
          eventType: event.type as 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party',
          startDate: new Date(event.startDate),
          startTime: event.startTime || 'N/A',
          endingDate: new Date(event.endingDate),
          endingTime: event.endingTime || 'N/A',
          eventVisibility: event.eventVisibility || 'Public',
          venueName: event.venueName || 'TBD',
          venueAddress: event.venueAddress,
          city: event.city || 'Unknown',
          tickets: event.tickets || [],
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
      // Find event in events state (from getAllEvents)
      const existingEvent = events.find((e) => e.id === id);
      if (!existingEvent) {
        throw new Error('Event not found in local state');
      }
      console.log('Using existing event from state:', existingEvent);

      // Optionally call getEventById if needed for additional data
      let formattedEvent: EventProps = { ...existingEvent };
      try {
        const eventDetails: RawEventProps = await eventService.getEventById(id);
        console.log('Event details fetched (getEventById):', eventDetails);

        // Check if eventDetails contains valid event data
        if (eventDetails.id && eventDetails.title) {
          formattedEvent = {
            id: eventDetails.id,
            user_id: eventDetails.user_id,
            userName: eventDetails.userName || existingEvent.userName || 'Event Host',
            userImage: eventDetails.userImage || existingEvent.userImage || '',
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
        } else {
          console.warn('getEventById returned invalid data, using existing event');
        }
      } catch (apiError) {
        console.warn('getEventById failed, using existing event:', apiError);
      }

      console.log('Formatted event for modal:', formattedEvent);
      setSelectedEvent(formattedEvent);
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Error handling view details for ID ${id}:`, error);
      toast.error('Failed to load event details. Please try again.');
    }
  };

  const handleApply = (eventId: string, ticketType: string, quantity: number) => {
    console.log(`Applying for event ${eventId} with ticket type: ${ticketType}, quantity: ${quantity}`);
    toast.success(`Applied for ${quantity} ${ticketType} ticket(s) successfully!`);
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

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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