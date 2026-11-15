import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, MapPin, Plus, Ticket, Users, Heart, Share2, AlertCircle, CalendarX, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import eventService from '../../services/event/eventService';
import EventModal from '../../components/basics/EventModal';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'; // Assuming you have a Tabs component

const TAB_COPY: Record<'upcoming' | 'paid' | 'created' | 'completed', { empty: string }> = {
  upcoming: { empty: 'No upcoming events yet. Check back soon or create your own.' },
  paid: { empty: 'No paid events found.' },
  created: { empty: "You haven't created any events yet." },
  completed: { empty: 'No completed events to show.' },
};

// Mirrors the real card's proportions so the grid doesn't jump when data arrives
const EventCardSkeleton: React.FC = () => (
  <Card className="h-80 rounded-xl border-0 shadow-md overflow-hidden">
    <div className="h-full w-full bg-muted animate-pulse relative">
      <div className="absolute bottom-6 left-4 right-4 space-y-2">
        <div className="h-5 w-2/3 bg-muted-foreground/20 rounded" />
        <div className="h-3 w-1/3 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  </Card>
);

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

// Raw shape coming back from the API. Mongoose documents come back with `_id`
// (and sometimes both `_id` and a virtual `id`), so both are optional here and
// resolved defensively in formatEvents/handleViewDetails below.
interface RawEventProps {
  id?: string;
  _id?: string;
  title?: string;
  eventTitle?: string;
  name?: string;
  userName: string;
  userImage: string;
  description?: string;
  eventDescription?: string;
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

// Pulls a usable string id off a raw API record, whichever field it landed in.
const resolveId = (raw: RawEventProps): string | undefined => {
  if (raw.id) return raw.id;
  if (raw._id) return raw._id;
  return undefined;
};

// Different endpoints on the backend have returned the title under different
// keys (eventTitle vs title vs name). Check all of them, and treat empty
// strings the same as missing, so a stray `title: ""` never shadows the
// field that actually has the value.
const firstNonEmpty = (...values: (string | undefined)[]): string => {
  for (const value of values) {
    if (value && value.trim().length > 0) return value;
  }
  return '';
};

const resolveTitle = (raw: RawEventProps): string => {
  return firstNonEmpty(raw.eventTitle, raw.title, raw.name);
};

const resolveDescription = (raw: RawEventProps): string => {
  return firstNonEmpty(raw.eventDescription, raw.description);
};

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
  const minTicketPrice = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;
  const [isLiked, setIsLiked] = useState(false);
  const eventDate = format(startDate, 'EEE, MMM d, yyyy');
  const dayNumber = format(startDate, 'd');
  const monthAbbr = format(startDate, 'MMM');

  if (!id && import.meta.env.DEV) {
    // Loud dev-only warning so a missing id is caught immediately instead of
    // silently producing a dead "View Details" button.
    console.warn(`EventCard: "${eventTitle}" has no id — View Details will not open the modal.`);
  }

  return (
    <Card
      className="group relative h-80 cursor-pointer overflow-hidden rounded-2xl border border-border/60 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
      onClick={() => id && onViewDetails(id)}
    >
      {/* Background image, subtle zoom on hover only — purely decorative */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-105"
          style={{
            backgroundImage: mainBanner ? `url(${mainBanner})` : "url('/api/placeholder/800/400')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"></div>
      </div>

      {/* Date badge — always visible, top-left */}
      <div className="absolute left-4 top-4 z-20 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-black/5">
        <div className="w-14 h-14 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground uppercase">{monthAbbr}</span>
          <span className="text-xl font-bold text-foreground">{dayNumber}</span>
        </div>
      </div>

      {/* Type / price / age badges — always visible, top-right */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <Badge variant="secondary" className="font-medium text-xs px-3 py-1 shadow-md bg-card text-foreground">
          {eventType}
        </Badge>
        <Badge variant="outline" className="bg-card text-foreground flex items-center gap-1 text-xs px-3 py-1 shadow-md">
          <Ticket className="h-3 w-3" />
          {tickets.length > 0 ? `From ₹${minTicketPrice}` : 'Free Entry'}
        </Badge>
        {ageRestriction && (
          <Badge variant="destructive" className="text-xs px-3 py-1 shadow-md">
            18+
          </Badge>
        )}
      </div>

      {/* Persistent identity block — this is what tells the user what the event
          IS. It never fades or hides; hovering only adds the description and
          action buttons below it. */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white line-clamp-1 mb-1.5">{eventTitle || 'Untitled Event'}</h3>

        <div className="flex flex-wrap items-center text-white/85 text-xs gap-x-3 gap-y-1 mb-3">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{startTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="truncate max-w-[120px]">{venueName}, {city}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3.5 w-3.5 mr-1" />
            <span>{attendees} attending</span>
          </div>
        </div>

        {/* Description is always visible on touch/small screens (where hover
            isn't available) and expands on hover from md upwards. */}
        <div className="mb-3 max-h-8 overflow-hidden opacity-100 transition-all duration-300 ease-in-out md:mb-0 md:max-h-0 md:opacity-0 md:group-hover:mb-3 md:group-hover:max-h-24 md:group-hover:opacity-100">
          <p className="text-xs text-white/80 line-clamp-2">{eventDescription}</p>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs px-2.5 h-8 text-foreground bg-card/90 border-none hover:bg-card"
              onClick={(e) => {
                e.stopPropagation();
                toast.success('Share link copied to clipboard!');
              }}
              aria-label="Share event"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`text-xs px-2.5 h-8 border-none ${isLiked ? 'bg-destructive text-white hover:bg-destructive/90' : 'bg-card/90 text-foreground hover:bg-card'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
                toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
              }}
              aria-label="Save event"
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-white' : ''}`} />
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            className="text-xs px-4 h-8 bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              if (id) onViewDetails(id);
            }}
            disabled={!id}
            title={!id ? 'This event is missing an id from the API response' : undefined}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const EventGallery: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'paid' | 'created' | 'completed'>('upcoming');
  const [refreshKey, setRefreshKey] = useState(0);

  const formatEvents = (rawEvents: RawEventProps[]): EventProps[] => {
    return rawEvents.map((event: RawEventProps) => ({
      id: resolveId(event),
      user_id: event.user_id,
      userName: event.userName || 'Event Host',
      userImage: event.userImage || '',
      eventTitle: resolveTitle(event),
      eventDescription: resolveDescription(event),
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
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        let fetchedEvents: RawEventProps[] = [];

        switch (activeTab) {
          case 'upcoming':
            fetchedEvents = await eventService.getAllEvents();
            break;
          case 'paid':
            fetchedEvents = await eventService.getPaidEvents();
            break;
          case 'created':
            fetchedEvents = await eventService.getCreatedByUserEvents();
            break;
          case 'completed':
            fetchedEvents = await eventService.getCompletedEvents();
            break;
          default:
            fetchedEvents = await eventService.getAllEvents();
        }

        console.log(`Fetched ${activeTab} Events (raw):`, fetchedEvents);
        const formattedEvents = formatEvents(fetchedEvents);
        console.log(`Formatted ${activeTab} Events:`, formattedEvents);
        setEvents(formattedEvents);
      } catch (err) {
        setError(`Failed to fetch ${activeTab} events. Please try again later.`);
        console.error(`Error fetching ${activeTab} events:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [activeTab, refreshKey]);

  const handleViewDetails = async (id: string) => {
    if (!id) {
      toast.error('This event is missing an id and cannot be opened.');
      return;
    }

    try {
      const existingEvent = events.find((e) => e.id === id);
      if (!existingEvent) {
        throw new Error('Event not found in local state');
      }
      console.log('Using existing event from state:', existingEvent);

      let formattedEvent: EventProps = { ...existingEvent };
      try {
        const eventDetails: RawEventProps = await eventService.getEventById(id);
        console.log('Event details fetched (getEventById):', eventDetails);

        const detailsId = resolveId(eventDetails);
        const detailsTitle = resolveTitle(eventDetails);
        if (detailsId && detailsTitle) {
          formattedEvent = {
            id: detailsId,
            user_id: eventDetails.user_id,
            userName: eventDetails.userName || existingEvent.userName || 'Event Host',
            userImage: eventDetails.userImage || existingEvent.userImage || '',
            eventTitle: detailsTitle,
            eventDescription: resolveDescription(eventDetails),
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

  const handleCreateEvent = () => {
    navigate('/event-create');
  };

  const handleRetry = () => {
    setError(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-display)] sm:text-3xl">Events</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse, manage, and track events in one place</p>
        </div>
        <Button
          className="flex items-center gap-2 shadow-sm"
          onClick={handleCreateEvent}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="created">Created by You</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
              <div className="h-11 w-11 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Try again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center mb-3">
                <CalendarX className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No events found</p>
              <p className="text-sm text-muted-foreground max-w-sm">{TAB_COPY[activeTab].empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} {...event} onViewDetails={handleViewDetails} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      
<EventModal
  event={selectedEvent}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
    </div>
  );
};

export default EventGallery;