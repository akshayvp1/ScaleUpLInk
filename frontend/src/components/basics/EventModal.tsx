import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import {
  Calendar,
  MapPin,
  X,
  Share2,
  Send,
  Heart,
  Clock,
  Users,
  Info,
  Globe,
  Lock,
  ShieldAlert,
  Navigation,
  Image as ImageIcon,
  History,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SeatMap from '../seats/SeatMap';
import seatService, { Seat } from '../../services/seat/seatServics';
import ShareEventModal from '../chat/ShareEventModal';
import { useAppSelector } from '../../redux/hooks';

interface EventProps {
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
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  createdAt?: string;
  updatedAt?: string;
  organizer?: string;
  capacity?: number;
  attendees?: number;
  seatRows?: string[]; // display order of rows, e.g. ["A","B","C","D","E","F"]
}

interface EventModalProps {
  event: EventProps | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, currentUserId = null }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'seats'>('details');
  const [isLiked, setIsLiked] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigate = useNavigate();

  const reduxUserId = useAppSelector(
    (state) => state.auth.user?._id ?? state.auth.user?.id ?? null
  );
  const viewerId = currentUserId ?? reduxUserId;

  React.useEffect(() => {
    if (event) {
      setActiveTab('details');
      setSeats([]);
    }
  }, [event]);

  // Fetch seats only when the seats tab is opened, so we don't hit the API
  // for every event card the user glances at. While the tab is open, re-poll
  // so seats released by other shoppers (or expired holds) become available.
  React.useEffect(() => {
    if (!event?.id || activeTab !== 'seats') return;

    let cancelled = false;

    const fetchSeats = async (showLoading: boolean) => {
      if (showLoading) setIsLoadingSeats(true);
      try {
        const data = await seatService.getSeatsForEvent(event.id as string);
        if (!cancelled) setSeats(data);
      } catch (err) {
        console.error('Failed to fetch seats:', err);
        if (showLoading) {
          toast.error('Could not load the seat map. Please try again.');
        }
      } finally {
        if (showLoading && !cancelled) setIsLoadingSeats(false);
      }
    };

    fetchSeats(true);
    const timer = window.setInterval(() => fetchSeats(false), 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [event?.id, activeTab]);

  if (!event) return null;

  const totalCapacityRemaining = seats.filter((s) => s.status !== 'booked').length;
  const lowestPrice = seats.length > 0 ? Math.min(...seats.map((s) => s.price)) : 0;
  const isFreeEvent = seats.length > 0 && seats.every((s) => s.price === 0);

  const dayOfMonth = format(new Date(event.startDate), 'd');
  const monthShort = format(new Date(event.startDate), 'MMM');
  const dayName = format(new Date(event.startDate), 'EEE');

  const isMultiDay =
    event.endingDate &&
    format(new Date(event.startDate), 'yyyy-MM-dd') !== format(new Date(event.endingDate), 'yyyy-MM-dd');

  const eventLink = event.id
    ? `${window.location.origin}/events?eventId=${encodeURIComponent(event.id)}`
    : window.location.href;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.eventTitle,
          text: `Check out ${event.eventTitle} on Melete`,
          url: eventLink,
        })
        .catch(() => {
          /* user cancelled share sheet, no-op */
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(eventLink);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleOpenShareToChat = () => {
    if (!event.id) {
      toast.error('This event cannot be shared yet.');
      return;
    }
    setIsShareOpen(true);
  };

  const handleSave = () => {
    setIsLiked((prev) => {
      toast.success(prev ? 'Removed from favorites' : 'Added to favorites');
      return !prev;
    });
  };

  // Called by SeatMap once the user picks seats and hits "Continue to payment".
  // Holds the seats server-side FIRST, then navigates — so nobody else can
  // grab them while the user is en route to Checkout.
  const handleContinueToPayment = async (selected: Seat[]) => {
    if (!event.id || selected.length === 0) return;
    setIsHolding(true);
    try {
      await seatService.holdSeats(event.id, selected.map((s) => s.seatLabel));
      onClose();
      navigate('/checkout/checkout', {
        state: {
          event,
          selectedSeats: selected,
          totalPrice: selected.reduce((sum, s) => sum + s.price, 0),
        },
      });
    } catch (err) {
      console.error('Failed to hold seats:', err);
      toast.error('Some of those seats were just taken. Please reselect.');
      // Refresh the seat map so the taken seats show as unavailable
      if (event.id) {
        const data = await seatService.getSeatsForEvent(event.id);
        setSeats(data);
      }
    } finally {
      setIsHolding(false);
    }
  };

  const formatMetaDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : format(parsed, 'MMM dd, yyyy · h:mm a');
  };

  const listedOn = formatMetaDate(event.createdAt);
  const lastUpdated = formatMetaDate(event.updatedAt);

  const mapsQuery = encodeURIComponent(
    event.venueAddress ? `${event.venueName}, ${event.venueAddress}, ${event.city}` : `${event.venueName}, ${event.city}`
  );

  // FIX: `??` doesn't catch an empty array — event.seatRows can come back
  // as [] (falsy in effect, but not nullish), which silently produced
  // rows=[] and rendered zero seat rows even though `seats` had data.
  const seatRows =
    event.seatRows && event.seatRows.length > 0
      ? event.seatRows
      : Array.from(new Set(seats.map((s) => s.row))).sort();

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-full max-h-[100dvh] w-full flex-col overflow-hidden rounded-2xl border-border bg-card p-0 shadow-float sm:max-w-3xl md:h-5/6 md:max-w-4xl md:flex-row lg:max-w-6xl">
        {/* Left side - Event Image and Basic Info */}
        <div className="relative h-72 md:h-auto md:w-2/5 bg-gradient-to-br from-primary to-primary">
          <button
            className="absolute right-3 top-3 z-20 rounded-full bg-black/30 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/50"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10"></div>
            <img
              src={event.mainBanner || '/api/placeholder/800/1200'}
              alt={event.eventTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <div className="overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-black/5">
              <div className="bg-destructive text-white text-xs font-medium py-1 px-3 text-center">
                {monthShort.toUpperCase()}
              </div>
              <div className="px-3 py-2 text-center">
                <div className="text-2xl font-bold">{dayOfMonth}</div>
                <div className="text-xs text-muted-foreground uppercase">{dayName}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Badge className="bg-card/20 text-white border-none backdrop-blur-sm px-3 py-1 text-xs w-fit">
                {event.eventType}
              </Badge>
              <Badge className="bg-card/20 text-white border-none backdrop-blur-sm px-3 py-1 text-xs w-fit flex items-center gap-1">
                {event.eventVisibility === 'Private' ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                {event.eventVisibility}
              </Badge>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <h1 className="mb-3 text-2xl font-bold [font-family:var(--font-display)] md:text-3xl">{event.eventTitle}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(event.startDate), 'EEE, MMM dd, yyyy')}
                  {isMultiDay && ` – ${format(new Date(event.endingDate), 'EEE, MMM dd, yyyy')}`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {event.startTime}
                  {event.endingTime ? ` - ${event.endingTime}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.venueName}, {event.city}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Avatar className="h-8 w-8 border-2 border-white/30">
                <img
                  src={event.userImage || '/api/placeholder/100/100'}
                  alt={event.userName || 'Organizer'}
                  className="rounded-full object-cover w-full h-full"
                />
              </Avatar>
              <div>
                <div className="text-xs text-white/70">Organized by</div>
                <div className="text-sm font-medium">{event.userName || 'Event Host'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Details and Seats */}
        <div className="flex min-h-0 w-full flex-1 flex-col md:h-full md:w-3/5 md:flex-none">
          <div className="border-b border-border">
            <div className="flex gap-1 p-2">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'details'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Event Details
              </button>
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'seats'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setActiveTab('seats')}
              >
                Select Seats
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-b border-border bg-muted/20 p-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border hover:bg-muted text-muted-foreground"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border hover:bg-muted text-muted-foreground"
              onClick={handleOpenShareToChat}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Send
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full hover:bg-muted ${
                isLiked ? 'text-destructive border-destructive/20' : 'text-muted-foreground border-border'
              }`}
              onClick={handleSave}
            >
              <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
              {isLiked ? 'Saved' : 'Save'}
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            {activeTab === 'details' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Attending</div>
                      <div className="font-medium">{event.attendees ?? 0}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Seats left</div>
                      <div className="font-medium">{event.capacity || totalCapacityRemaining || 'Unlimited'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-medium">{isFreeEvent ? 'Free' : `From ₹${lowestPrice}`}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.eventVisibility === 'Private' ? (
                      <Lock className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground">Visibility</div>
                      <div className="font-medium">{event.eventVisibility}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {event.eventDescription || 'No description provided for this event yet.'}
                  </p>

                  {event.ageRestriction && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs text-warning">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        <span className="font-medium">Age restricted:</span> This event is 18+. Valid government ID
                        may be required at entry.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Date &amp; Time</h3>
                  <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-sm text-foreground">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starts</span>
                      <span className="font-medium">
                        {format(new Date(event.startDate), 'EEEE, MMM dd, yyyy')} at {event.startTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ends</span>
                      <span className="font-medium">
                        {format(new Date(event.endingDate), 'EEEE, MMM dd, yyyy')}
                        {event.endingTime ? ` at ${event.endingTime}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="relative h-40 overflow-hidden rounded-xl bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                      <div className="font-medium">{event.venueName}</div>
                      <div className="text-xs">{event.venueAddress || event.city}</div>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary font-medium"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get directions
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Organizer</h3>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4">
                    <Avatar className="h-10 w-10">
                      <img
                        src={event.userImage || '/api/placeholder/100/100'}
                        alt={event.userName || 'Organizer'}
                        className="rounded-full object-cover w-full h-full"
                      />
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{event.organizer || event.userName || 'Event Host'}</div>
                      <div className="text-xs text-muted-foreground">Event Organizer</div>
                    </div>
                  </div>
                </div>

                {event.promotionalImage && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Gallery
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-border">
                      <img
                        src={event.promotionalImage}
                        alt={`${event.eventTitle} promotional`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border text-sm">
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Event Type
                      </span>
                      <span className="font-medium text-foreground">{event.eventType}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        {event.eventVisibility === 'Private' ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                        Visibility
                      </span>
                      <span className="font-medium text-foreground">{event.eventVisibility}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> Age Restriction
                      </span>
                      <span className="font-medium text-foreground">{event.ageRestriction ? '18+ only' : 'All ages welcome'}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" /> Total Capacity
                      </span>
                      <span className="font-medium text-foreground">{event.capacity || totalCapacityRemaining || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" /> Current Attendees
                      </span>
                      <span className="font-medium text-foreground">{event.attendees ?? 0}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Full Address
                      </span>
                      <span className="font-medium text-foreground text-right max-w-[60%]">
                        {event.venueAddress || `${event.venueName}, ${event.city}`}
                      </span>
                    </div>
                    {listedOn && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Listed On
                        </span>
                        <span className="font-medium text-foreground">{listedOn}</span>
                      </div>
                    )}
                    {lastUpdated && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <History className="h-4 w-4" /> Last Updated
                        </span>
                        <span className="font-medium text-foreground">{lastUpdated}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isLoadingSeats ? (
              <div className="flex items-center justify-center h-full py-16 text-sm text-muted-foreground">
                Loading seat map…
              </div>
            ) : seats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                No seat map has been set up for this event yet.
              </div>
            ) : (
              <SeatMap
                key={event.id}
                seats={seats}
                rows={seatRows}
                currentUserId={viewerId}
                isSubmitting={isHolding}
                onContinue={handleContinueToPayment}
                onRefreshSeats={() => {
                  if (!event.id) return;
                  seatService
                    .getSeatsForEvent(event.id)
                    .then(setSeats)
                    .catch(() => {
                      /* next poll will retry */
                    });
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {isShareOpen && event.id && (
      <ShareEventModal
        event={{
          id: event.id,
          title: event.eventTitle,
          image: event.mainBanner,
          startDate: event.startDate,
          startTime: event.startTime,
          venue: event.venueName,
          city: event.city,
        }}
        onClose={() => setIsShareOpen(false)}
      />
    )}
    </>
  );
};

export default EventModal;