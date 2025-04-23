
// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogFooter } from '../../components/ui/dialog';
// import { Button } from '../../components/ui/button';
// import { Badge } from '../../components/ui/badge';
// import { Calendar, Clock, MapPin, Users, Lock, Unlock, DollarSign, Info } from 'lucide-react';
// import { format } from 'date-fns';
// import { Label } from '../../components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
// import { Separator } from '../../components/ui/separator';
// import { Input } from '../../components/ui/input';

// interface Ticket {
//   type: string;
//   price: number;
//   quantity: number;
//   description?: string;
//   perks?: string[];
// }

// interface EventProps {
//   id?: string;
//   user_id?: string;
//   eventTitle: string;
//   eventDescription: string;
//   eventType: 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party';
//   startDate: Date;
//   startTime: string;
//   endingDate: Date;
//   endingTime?: string;
//   eventVisibility: 'Public' | 'Private';
//   venueName: string;
//   venueAddress?: string;
//   city: string;
//   tickets: Ticket[];
//   ageRestriction: boolean;
//   mainBanner: string;
//   promotionalImage?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   organizer?: string;
//   capacity?: number;
// }

// interface EventModalProps {
//   event: EventProps | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onApply: (eventId: string, ticketType: string, quantity: number) => void;
// }

// const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onApply }) => {
//   const [selectedTicketType, setSelectedTicketType] = useState<string>(''); 
//   const [ticketQuantity, setTicketQuantity] = useState<number>(1);

//   if (!event) return null;

  
//   // console.log('EventModal received event:', event);
//   // console.log('Tickets:', event.tickets);

//   const selectedTicket = event.tickets.find(ticket => ticket.type === selectedTicketType);
//   const totalPrice = selectedTicket ? selectedTicket.price * ticketQuantity : 0;
//   const isSameDay = event.startDate.toDateString() === event.endingDate.toDateString();

//   const handleQuantityChange = (value: string) => {
//     const numValue = parseInt(value, 10);
//     if (isNaN(numValue) || numValue < 1) {
//       setTicketQuantity(1);
//     } else if (selectedTicket && numValue <= selectedTicket.quantity) {
//       setTicketQuantity(numValue);
//     } else {
//       setTicketQuantity(selectedTicket?.quantity || 1); 
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
//         {/* Banner Header */}
//         <div className="relative h-64 w-full">
//           <div
//             className="h-full w-full bg-cover bg-center"
//             style={{
//               backgroundImage: `url(${event.mainBanner || '/api/placeholder/1200/600'})`,
//             }}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
//           <div className="absolute bottom-4 left-6 right-6">
//             <div className="flex items-center gap-2 mb-2">
//               <Badge className="bg-primary text-primary-foreground">{event.eventType}</Badge>
//               {event.ageRestriction && <Badge variant="destructive">18+</Badge>}
//               <Badge variant="outline" className="bg-background/80">
//                 {event.eventVisibility === 'Public' ? (
//                   <Unlock className="h-3 w-3 mr-1" />
//                 ) : (
//                   <Lock className="h-3 w-3 mr-1" />
//                 )}
//                 {event.eventVisibility}
//               </Badge>
//             </div>
//             <h2 className="text-2xl font-bold text-white">{event.eventTitle}</h2>
//           </div>
//           <Button 
//             variant="ghost" 
//             size="icon" 
//             className="absolute top-4 right-4 rounded-full bg-background/50 hover:bg-background/80"
//             onClick={onClose}
//           >
//             <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
//             </svg>
//           </Button>
//         </div>

//         <div className="p-6">
//           <Tabs defaultValue="details" className="w-full">
//             <TabsList className="grid grid-cols-3 mb-6">
//               <TabsTrigger value="details">Event Details</TabsTrigger>
//               <TabsTrigger value="tickets">Tickets</TabsTrigger>
//               <TabsTrigger value="venue">Venue & Schedule</TabsTrigger>
//             </TabsList>

//             <TabsContent value="details" className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-2">About This Event</h3>
//                 <div className="max-h-48 overflow-y-auto rounded-md border p-4">
//                   <p className="text-muted-foreground">{event.eventDescription}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2 text-sm">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <span className="font-medium">Dates:</span>
//                     {format(event.startDate, 'EEE, MMM d, yyyy')} - {format(event.endingDate, 'EEE, MMM d, yyyy')}
//                   </div>
//                   <div className="flex items-center gap-2 text-sm">
//                     <Clock className="h-4 w-4 text-muted-foreground" />
//                     <span className="font-medium">Time:</span>
//                     {event.startTime} - {event.endingTime || 'TBD'}
//                   </div>
//                   <div className="flex items-center gap-2 text-sm">
//                     <MapPin className="h-4 w-4 text-muted-foreground" />
//                     <span className="font-medium">Venue:</span>
//                     {event.venueName}, {event.city}
//                   </div>
//                   {event.venueAddress && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <span className="font-medium ml-6">Address:</span>
//                       {event.venueAddress}
//                     </div>
//                   )}
//                   {event.capacity && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <Users className="h-4 w-4 text-muted-foreground" />
//                       <span className="font-medium">Capacity:</span>
//                       {event.capacity} attendees
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   {event.organizer && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <Users className="h-4 w-4 text-muted-foreground" />
//                       <span className="font-medium">Organizer:</span>
//                       {event.organizer}
//                     </div>
//                   )}
//                   <div className="flex items-center gap-2 text-sm">
//                     <Info className="h-4 w-4 text-muted-foreground" />
//                     <span className="font-medium">Visibility:</span>
//                     {event.eventVisibility}
//                   </div>
//                   {event.createdAt && (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <Info className="h-4 w-4" />
//                       Created: {format(new Date(event.createdAt), 'PPP')}
//                     </div>
//                   )}
//                   {event.updatedAt && (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <Info className="h-4 w-4" />
//                       Last Updated: {format(new Date(event.updatedAt), 'PPP')}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <h3 className="text-lg font-semibold">Ticket Information</h3>
//                 {Array.isArray(event.tickets) && event.tickets.length > 0 ? (
//                   <ul className="space-y-2">
//                     {event.tickets.map((ticket) => (
//                       <li key={ticket.type} className="flex items-center gap-2 text-sm">
//                         <DollarSign className="h-4 w-4 text-muted-foreground" />
//                         <span className="font-medium">{ticket.type}:</span>
//                         ₹{ticket.price.toFixed(2)} - {ticket.quantity} available
//                         {ticket.description && <span className="text-muted-foreground ml-2">({ticket.description})</span>}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-sm text-muted-foreground">No tickets available (Check data)</p>
//                 )}
//               </div>
//             </TabsContent>

//             <TabsContent value="tickets" className="space-y-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Available Tickets</h3>
//                 {Array.isArray(event.tickets) && event.tickets.length > 0 ? (
//                   <div className="grid grid-cols-1 gap-4">
//                     {event.tickets.map((ticket) => (
//                       <Card key={ticket.type} className={`overflow-hidden ${selectedTicketType === ticket.type ? 'ring-2 ring-primary' : ''}`}>
//                         <CardHeader className="pb-2">
//                           <div className="flex justify-between items-center">
//                             <CardTitle>{ticket.type}</CardTitle>
//                             <Badge variant={ticket.quantity > 10 ? "outline" : "secondary"}>
//                               {ticket.quantity} remaining
//                             </Badge>
//                           </div>
//                           <CardDescription>
//                             <div className="flex items-center gap-1">
//                               <DollarSign className="h-4 w-4" />
//                               <span className="text-lg font-bold">₹                              
//                                 {ticket.price.toFixed(2)}</span>
//                               <span className="text-sm text-muted-foreground">/ ticket</span>
//                             </div>
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent className="pb-4">
//                           {ticket.description && <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>}
//                           {ticket.perks && ticket.perks.length > 0 && (
//                             <ul className="text-sm space-y-1">
//                               {ticket.perks.map((perk, index) => (
//                                 <li key={index} className="flex items-center gap-2">
//                                   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500">
//                                     <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
//                                   </svg>
//                                   {perk}
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                         </CardContent>
//                         <CardFooter className="pt-0 flex justify-between items-center">
//                           <Button 
//                             variant={selectedTicketType === ticket.type ? "default" : "outline"} 
//                             className="w-1/2 mr-2"
//                             onClick={() => setSelectedTicketType(ticket.type)}
//                           >
//                             {selectedTicketType === ticket.type ? "Selected" : "Select"}
//                           </Button>
//                           {selectedTicketType === ticket.type && (
//                             <div className="flex items-center gap-2">
//                               <Label>Qty:</Label>
//                               <Input
//                                 type="number"
//                                 min="1"
//                                 max={ticket.quantity}
//                                 value={ticketQuantity}
//                                 onChange={(e) => handleQuantityChange(e.target.value)}
//                                 className="w-16"
//                               />
//                             </div>
//                           )}
//                         </CardFooter>
//                       </Card>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-sm text-muted-foreground">No tickets available (Check data)</p>
//                 )}
//               </div>
//             </TabsContent>

//             <TabsContent value="venue" className="space-y-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Venue Information</h3>
//                 <div className="bg-muted/40 p-4 rounded-lg">
//                   <div className="flex items-start gap-3">
//                     <MapPin className="h-5 w-5 text-primary mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">{event.venueName}</h4>
//                       <p className="text-sm text-muted-foreground">
//                         {event.venueAddress && `${event.venueAddress}, `}{event.city}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="h-48 bg-muted rounded-md flex items-center justify-center">
//                   <div className="text-center">
//                     <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
//                     <p className="text-sm text-muted-foreground">Map view would appear here</p>
//                   </div>
//                 </div>
//                 <div className="mt-6 space-y-4">
//                   <h3 className="text-lg font-semibold">Event Schedule</h3>
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-5 w-5 text-primary" />
//                       <div>
//                         <p className="font-medium">{format(event.startDate, 'EEEE, MMMM d, yyyy')}</p>
//                         <p className="text-sm text-muted-foreground">{event.startTime} - {event.endingTime || 'TBD'}</p>
//                       </div>
//                     </div>
//                     {!isSameDay && (
//                       <>
//                         <Separator className="my-2" />
//                         <div className="flex items-center gap-2">
//                           <Calendar className="h-5 w-5 text-primary" />
//                           <div>
//                             <p className="font-medium">{format(event.endingDate, 'EEEE, MMMM d, yyyy')}</p>
//                             <p className="text-sm text-muted-foreground">Ends: {event.endingTime || 'TBD'}</p>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>

//         <DialogFooter className="px-6 py-4 border-t">
//           <div className="flex items-center justify-between w-full">
//             <div className="text-sm">
//               {selectedTicket ? (
//                 <div className="flex items-center gap-2">
//                   <Badge variant="outline">{selectedTicket.type}</Badge>
//                   <span className="font-semibold">₹                  
//                     {totalPrice.toFixed(2)}</span>
//                   <span className="text-muted-foreground">({ticketQuantity} x ₹{selectedTicket.price.toFixed(2)})</span>
//                 </div>
//               ) : (
//                 <span className="text-muted-foreground">No ticket selected</span>
//               )}
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => onApply(event.id || '', selectedTicketType, ticketQuantity)}
//                 disabled={!selectedTicketType || !event.id}
//               >
//                 {selectedTicket ? `Book Now: ₹${totalPrice.toFixed(2)}` : 'Select a Ticket'}
//               </Button>
//             </div>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EventModal;

import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Calendar, MapPin, X, Share2, Heart, Clock, Users, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  description?: string;
  perks?: string[];
}

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
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  createdAt?: string;
  updatedAt?: string;
  organizer?: string;
  capacity?: number;
}

interface EventModalProps {
  event: EventProps | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (eventId: string, ticketType: string, quantity: number) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onApply }) => {
  const [ticketQuantities, setTicketQuantities] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'tickets'>('details');
  const navigate = useNavigate();

  // Initialize ticket quantities based on event tickets when event changes
  React.useEffect(() => {
    if (event && event.tickets) {
      setTicketQuantities(Array(event.tickets.length).fill(0));
    }
  }, [event]);

  if (!event) return null;

  const handleQuantityDecrease = (index: number) => {
    if (ticketQuantities[index] > 0) {
      const newQuantities = [...ticketQuantities];
      newQuantities[index] -= 1;
      setTicketQuantities(newQuantities);
    }
  };

  const handleQuantityIncrease = (index: number) => {
    if (event.tickets[index] && ticketQuantities[index] < event.tickets[index].quantity) {
      const newQuantities = [...ticketQuantities];
      newQuantities[index] += 1;
      setTicketQuantities(newQuantities);
    }
  };

  const totalPrice = event.tickets.reduce((sum, ticket, index) => {
    return sum + ticket.price * (ticketQuantities[index] || 0);
  }, 0);

  const hasSelectedTickets = ticketQuantities.some((qty) => qty > 0);

  // Get day and month for visual display
  const dayOfMonth = format(new Date(event.startDate), 'd');
  const monthShort = format(new Date(event.startDate), 'MMM');
  const dayName = format(new Date(event.startDate), 'EEE');

  const handleCheckout = () => {
    const selectedTickets = event.tickets
      .map((ticket, index) => ({
        type: ticket.type,
        quantity: ticketQuantities[index],
        price: ticket.price,
        description: ticket.description,
        perks: ticket.perks
      }))
      .filter((ticket) => ticket.quantity > 0);

    if (selectedTickets.length > 0) {
      // Call onApply if provided
      if (onApply && event.id) {
        selectedTickets.forEach((ticket) => {
          onApply(event.id!, ticket.type, ticket.quantity);
        });
      }

      // Close the modal
      onClose();
      
      // Navigate to checkout with the complete event data
      navigate('/checkout/checkout', {
        state: {
          event: event,
          selectedTickets,
          totalPrice
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-3xl md:max-w-4xl lg:max-w-6xl h-full md:h-5/6 max-h-screen w-full rounded-lg overflow-hidden flex flex-col md:flex-row bg-white">
        {/* Left side - Event Image and Basic Info */}
        <div className="relative h-72 md:h-auto md:w-2/5 bg-gradient-to-br from-orange-800 to-purple-900">
          {/* Close button */}
          <button
            className="absolute right-3 top-3 z-20 rounded-full bg-black/30 p-1.5 hover:bg-black/50 transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          
          {/* Image with overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10"></div>
            <img
              src={event.mainBanner || '/api/placeholder/800/1200'}
              alt={event.eventTitle}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Date badge */}
          <div className="absolute top-6 left-6 z-20 flex items-center">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="bg-red-600 text-white text-xs font-medium py-1 px-3 text-center">
                {monthShort.toUpperCase()}
              </div>
              <div className="px-3 py-2 text-center">
                <div className="text-2xl font-bold">{dayOfMonth}</div>
                <div className="text-xs text-gray-500 uppercase">{dayName}</div>
              </div>
            </div>
            
            {/* Event type badge */}
            <Badge className="ml-3 bg-white/20 text-white border-none backdrop-blur-sm px-3 py-1 text-xs">
              {event.eventType}
            </Badge>
          </div>
          
          {/* Event title and basic info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{event.eventTitle}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.startDate), 'EEE, MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{event.startTime} - {event.endingTime || '16:00'}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{event.venueName}, {event.city}</span>
              </div>
            </div>
            
            {/* Organizer info */}
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

        {/* Right side - Details and Tickets */}
        <div className="flex flex-col w-full md:w-3/5 h-full">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Event Details
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'tickets'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('tickets')}
              >
                Tickets
              </button>
            </div>
          </div>

          {/* Social actions */}
          <div className="flex justify-end gap-2 p-4 border-b border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              <Heart className="h-4 w-4 mr-1.5" />
              Save
            </Button>
          </div>

          {/* Content area with scrolling */}
          <div className="flex-grow overflow-y-auto p-6">
            {activeTab === 'details' ? (
              <>
                {/* Details tab content */}
                <div className="space-y-6">
                  {/* Event summary */}
                  <div className="bg-blue-50 rounded-lg p-4 flex gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-xs text-gray-500">Capacity</div>
                        <div className="font-medium">{event.capacity || 'Unlimited'}</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-2">
                      <Info className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className="font-medium">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                            Available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {event.eventDescription}
                    </p>
                    
                    {event.ageRestriction && (
                      <div className="mt-4 bg-amber-50 text-amber-800 text-xs p-3 rounded-md flex items-center">
                        <span className="font-medium mr-1">Note:</span>
                        <span>This event has age restrictions. ID may be required.</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Location details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Location</h3>
                    <div className="bg-gray-100 h-40 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                        <div className="font-medium">{event.venueName}</div>
                        <div className="text-xs">{event.venueAddress || event.city}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Tickets tab content */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Tickets</h3>
                  <div className="space-y-4">
                    {event.tickets.map((ticket, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{ticket.type}</h4>
                                <p className="text-sm text-gray-500">{ticket.description || 'Standard entry'}</p>
                              </div>
                              <div className="text-lg font-bold text-orange-700">₹{ticket.price}</div>
                            </div>
                            
                            {ticket.perks && ticket.perks.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {ticket.perks.map((perk, i) => (
                                  <Badge key={i} className="bg-blue-50 text-orange-700 border-none text-xs">
                                    {perk}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-3">
                              {ticket.quantity} tickets available
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full border-gray-300"
                              onClick={() => handleQuantityDecrease(index)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium">{ticketQuantities[index] || 0}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full border-gray-300"
                              onClick={() => handleQuantityIncrease(index)}
                              aria-label="Increase quantity"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Purchase footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="font-bold text-xl text-orange-800">
                {hasSelectedTickets ? `₹${totalPrice}` : '₹0'}
              </div>
              <div className="text-xs text-gray-500">
                {hasSelectedTickets ? 'Including all taxes & fees' : 'Select tickets to continue'}
              </div>
            </div>
            <Button
              className={`px-8 py-2 rounded-lg text-white font-medium ${
                hasSelectedTickets 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasSelectedTickets}
              onClick={handleCheckout}
            >
              {hasSelectedTickets ? 'Proceed to Checkout' : 'Select Tickets'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;