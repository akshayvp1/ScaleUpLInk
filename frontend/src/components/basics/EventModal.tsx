// // src/components/EventModal.tsx
// import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
// import { Button } from '../../components/ui/button';
// import { Badge } from '../../components/ui/badge';
// import { Calendar, Clock, MapPin, Users } from 'lucide-react';
// import { format } from 'date-fns';
// import { EventProps } from './eventCard';

// interface EventModalProps {
//   event: EventProps | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onApply: (eventId: string) => void;
// }

// const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onApply }) => {
//   if (!event) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>{event.title}</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div className="relative h-40 w-full overflow-hidden rounded-md">
//             <div
//               className="h-full w-full bg-cover bg-center"
//               style={{
//                 backgroundImage: event.mainBanner ? 
//                   `url(${event.mainBanner})` : 
//                   "url('/api/placeholder/800/400')"
//               }}
//             />
//           </div>
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <Badge>{event.type}</Badge>
//               {event.ageRestriction && <Badge variant="destructive">18+</Badge>}
//             </div>
//             <p className="text-sm text-muted-foreground">{event.description}</p>
//             <div className="text-sm">
//               <p className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4" />
//                 {format(event.startDate, 'EEE, MMM d, yyyy')} - {format(event.endingDate, 'EEE, MMM d, yyyy')}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Clock className="h-4 w-4" />
//                 {event.startTime} - {event.endingTime}
//               </p>
//               <p className="flex items-center gap-2">
//                 <MapPin className="h-4 w-4" />
//                 {event.venueName}, {event.city}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Users className="h-4 w-4" />
//                 {event.attendees} attending
//               </p>
//               <p className="font-semibold">Ticket Price: ${event.ticketPrice}</p>
//             </div>
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//           <Button onClick={() => onApply(event.id)}>Apply</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EventModal;



// src/components/EventModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, Users, Lock, Unlock, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

interface EventProps {
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
}

interface EventModalProps {
  event: EventProps | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (eventId: string, ticketType: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onApply }) => {
  const [selectedTicketType, setSelectedTicketType] = useState<string>(event?.tickets[0]?.type || '');

  if (!event) return null;

  const selectedTicket = event.tickets.find(ticket => ticket.type === selectedTicketType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.eventTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Banner Section */}
          <div className="relative h-60 w-full overflow-hidden rounded-md">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: event.mainBanner
                  ? `url(${event.mainBanner})`
                  : "url('/api/placeholder/1200/600')",
              }}
            />
            {event.promotionalImage && (
              <div className="absolute bottom-4 right-4 h-20 w-20 rounded-md overflow-hidden border-2 border-white">
                <img
                  src={event.promotionalImage}
                  alt="Promotional"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Event Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.eventType}</Badge>
              {event.ageRestriction && <Badge variant="destructive">18+</Badge>}
              <Badge variant="outline">
                {event.eventVisibility === 'Public' ? (
                  <Unlock className="h-4 w-4 mr-1" />
                ) : (
                  <Lock className="h-4 w-4 mr-1" />
                )}
                {event.eventVisibility}
              </Badge>
            </div>
            <p className="text-muted-foreground">{event.eventDescription}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Event Schedule</h3>
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {format(event.startDate, 'EEE, MMM d, yyyy')} - {format(event.endingDate, 'EEE, MMM d, yyyy')}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {event.startTime} - {event.endingTime || 'TBD'}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Venue</h3>
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {event.venueName}, {event.city}
                {event.venueAddress && `, ${event.venueAddress}`}
              </p>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tickets</h3>
            <div className="space-y-2">
              <Label htmlFor="ticketType">Select Ticket Type</Label>
              <Select
                value={selectedTicketType}
                onValueChange={setSelectedTicketType}
              >
                <SelectTrigger id="ticketType" className="w-full">
                  <SelectValue placeholder="Choose a ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {event.tickets.map((ticket) => (
                    <SelectItem key={ticket.type} value={ticket.type}>
                      {ticket.type} - ${ticket.price} ({ticket.quantity} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTicket && (
                <div className="text-sm">
                  <p className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Selected: {selectedTicket.type} - ${selectedTicket.price}
                  </p>
                  <p className="text-muted-foreground">
                    Available: {selectedTicket.quantity} tickets
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <h3 className="text-lg font-semibold">Additional Info</h3>
            {event.user_id && <p>Created by User ID: {event.user_id}</p>}
            {event.createdAt && (
              <p>Created: {format(new Date(event.createdAt), 'PPP')}</p>
            )}
            {event.updatedAt && (
              <p>Last Updated: {format(new Date(event.updatedAt), 'PPP')}</p>
            )}
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onApply(event.id || '', selectedTicketType)}
            disabled={!selectedTicketType || !event.id}
          >
            Apply for {selectedTicketType || 'Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;