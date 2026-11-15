
// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '../../../components/ui/table';
// import { Badge } from '../../../components/ui/badge';
// import { Button } from '../../../components/ui/button';
// import { Input } from '../../../components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '../../../components/ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
// import { Check, Eye, Search, X, Calendar, MapPin, Ticket, Users } from 'lucide-react';
// import { format } from 'date-fns';
// import eventManagement from '../../../services/admin/eventMangement';

// // Ticket interface
// interface Ticket {
//   type: string;
//   price: number;
//   quantity: number;
// }

// // Event interface
// interface Event {
//   id: string;
//   mainBanner: string;
//   title: string;
//   type: string;
//   userName: string;
//   userImage?: string;
//   startDate: string;
//   startTime: string;
//   endDate: string;
//   endTime: string;
//   visibility: 'Public' | 'Private';
//   venueName: string;
//   city: string;
//   venueAddress: string;
//   tickets: Ticket[];
//   ageRestriction: boolean;
//   isPremium: boolean;
//   status: 'pending' | 'approved' | 'cancelled' | 'completed';
// }

// export default function EventManagement() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showConfirm, setShowConfirm] = useState<{ action: 'approve' | 'reject' | null; eventId: string } | null>(null);

//   // Fetch events on component mount
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         setLoading(true);
//         const fetchedEvents = await eventManagement.getAllEvents();
//         // Transform fetched events to match the Event interface
//         const transformedEvents: Event[] = fetchedEvents.map((event: any) => ({
//           ...event,
//           status: event.status === 'approve' ? 'approved' : event.status,
//         }));
//         setEvents(transformedEvents);
//       } catch (err) {
//         setError('Failed to load events. Please try again.');
//         console.error('Error fetching events:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEvents();
//   }, []);

//   // Filter events based on search term
//   const filteredEvents = events.filter(
//     (event) =>
//       event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.city.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Function to approve an event
//   const handleApproveEvent = async (eventId: string) => {
//     try {
//       await eventManagement.approveEvent(eventId);
//       setEvents(
//         events.map((event) =>
//           event.id === eventId ? { ...event, status: 'approved' } : event
//         )
//       );
//     } catch (error) {
//       alert('Failed to approve event. Please try again.');
//       console.error('Error approving event:', error);
//     }
//   };

//   // Function to reject/cancel an event
//   const handleRejectEvent = async (eventId: string) => {
//     try {
//       await eventManagement.unapproveEvent(eventId);
//       setEvents(
//         events.map((event) =>
//           event.id === eventId ? { ...event, status: 'cancelled' } : event
//         )
//       );
//     } catch (error) {
//       alert('Failed to reject event. Please try again.');
//       console.error('Error rejecting event:', error);
//     }
//   };

//   // Handle confirmation
//   const handleConfirmAction = () => {
//     if (showConfirm) {
//       if (showConfirm.action === 'approve') {
//         handleApproveEvent(showConfirm.eventId);
//       } else if (showConfirm.action === 'reject') {
//         handleRejectEvent(showConfirm.eventId);
//       }
//       setShowConfirm(null);
//     }
//   };

//   // Handle cancel confirmation
//   const handleCancelAction = () => {
//     setShowConfirm(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center py-8 text-destructive text-lg font-semibold">{error}</div>;
//   }

//   return (
//     <div className="w-full px-6 py-8 space-y-6 bg-muted min-h-screen relative">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-foreground">Event Management Dashboard</h1>
//       </div>

//       <div className="flex items-center space-x-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//           <Input
//             placeholder="Search events by title, organizer, or city..."
//             className="pl-10 py-2 border-border rounded-md focus:ring-2 focus:ring-ring"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <Button
//           variant="outline"
//           className="py-2 border-border hover:bg-muted rounded-md"
//         >
//           Filter
//         </Button>
//       </div>

//       <Card className="shadow-lg rounded-lg overflow-hidden">
//         <CardContent className="p-0">
//           <Table>
//             <TableCaption className="py-4 text-muted-foreground">
//               List of events requiring moderation
//             </TableCaption>
//             <TableHeader>
//               <TableRow className="bg-muted">
//                 <TableHead className="font-semibold text-foreground">Event</TableHead>
//                 <TableHead className="font-semibold text-foreground">Organizer</TableHead>
//                 <TableHead className="font-semibold text-foreground">Type</TableHead>
//                 <TableHead className="font-semibold text-foreground">Date</TableHead>
//                 <TableHead className="font-semibold text-foreground">Location</TableHead>
//                 <TableHead className="font-semibold text-foreground">Visibility</TableHead>
//                 <TableHead className="font-semibold text-foreground">Premium</TableHead>
//                 <TableHead className="font-semibold text-foreground">Status</TableHead>
//                 <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredEvents.map((event) => (
//                 <TableRow key={event.id} className="hover:bg-muted">
//                   <TableCell>
//                     <div className="flex items-center space-x-3">
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <div className="relative w-12 h-12 rounded-md overflow-hidden cursor-pointer">
//                             <img
//                               src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
//                               alt={event.title}
//                               className="object-cover w-full h-full"
//                               onError={(e) => {
//                                 e.currentTarget.src = '/assets/images/event-placeholder.jpg';
//                               }}
//                             />
//                           </div>
//                         </DialogTrigger>
//                         <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
//                           <DialogHeader>
//                             <DialogTitle className="text-xl font-semibold text-foreground">
//                               {event.title}
//                             </DialogTitle>
//                           </DialogHeader>
//                           <div className="grid grid-cols-1 gap-4 py-2">
//                             <div className="relative h-32 rounded-lg overflow-hidden">
//                               <img
//                                 src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
//                                 alt={event.title}
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   e.currentTarget.src = '/assets/images/event-placeholder.jpg';
//                                 }}
//                               />
//                               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
//                                 <p className="text-white text-xs font-medium">{event.type}</p>
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Calendar className="h-3 w-3 text-primary" />
//                                     Date & Time
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p>
//                                     <span className="font-medium">Start:</span>{' '}
//                                     {format(new Date(event.startDate), 'MMM dd, yyyy')} at{' '}
//                                     {event.startTime}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">End:</span>{' '}
//                                     {format(new Date(event.endDate), 'MMM dd, yyyy')} at{' '}
//                                     {event.endTime}
//                                   </p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <MapPin className="h-3 w-3 text-primary" />
//                                     Venue
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p className="font-medium">{event.venueName}</p>
//                                   <p>{event.city}</p>
//                                   <p className="text-xs text-muted-foreground">{event.venueAddress}</p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Ticket className="h-3 w-3 text-primary" />
//                                     Tickets
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2">
//                                   <div className="flex flex-wrap gap-1">
//                                     {event.tickets.length > 0 ? (
//                                       event.tickets.map((ticket, index) => (
//                                         <Badge
//                                           key={index}
//                                           variant="secondary"
//                                           className="bg-primary/10 text-primary text-xs"
//                                         >
//                                           {ticket.type} (${ticket.price})
//                                         </Badge>
//                                       ))
//                                     ) : (
//                                       <Badge variant="outline" className="text-xs">
//                                         No Tickets Available
//                                       </Badge>
//                                     )}
//                                   </div>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Users className="h-3 w-3 text-primary" />
//                                     Details
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p>
//                                     <span className="font-medium">Age Restriction:</span>{' '}
//                                     {event.ageRestriction ? 'Yes' : 'No'}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">Visibility:</span>{' '}
//                                     {event.visibility}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">Premium:</span>{' '}
//                                     {event.isPremium ? 'Yes' : 'No'}
//                                   </p>
//                                 </CardContent>
//                               </Card>
//                             </div>
//                             <div className="flex justify-end gap-2 mt-2">
//                               <Button
//                                 variant="outline"
//                                 onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
//                                 disabled={event.status === 'cancelled'}
//                                 className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
//                               >
//                                 <X className="h-3 w-3 mr-1" />
//                                 Reject
//                               </Button>
//                               <Button
//                                 onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
//                                 disabled={event.status === 'approved'}
//                                 className="bg-primary hover:bg-primary text-white text-xs py-1 px-2"
//                               >
//                                 <Check className="h-3 w-3 mr-1" />
//                                 Approve
//                               </Button>
//                             </div>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                       <div className="font-medium text-foreground text-sm">{event.title}</div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-2">
//                       <Avatar className="h-8 w-8">
//                         <AvatarImage
//                           src={event.userImage || '/assets/images/user-placeholder.jpg'}
//                           alt={event.userName}
//                           className="object-cover"
//                         />
//                         <AvatarFallback className="bg-primary/10 text-primary text-xs">
//                           {event.userName.substring(0, 2).toUpperCase()}
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className="text-foreground text-sm">{event.userName}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant="outline" className="bg-primary/5 text-primary text-xs">
//                       {event.type}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-sm text-muted-foreground">
//                       <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
//                       <div className="text-muted-foreground text-xs">
//                         {event.startTime} - {event.endTime}
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-sm text-muted-foreground">
//                       <div>{event.venueName}</div>
//                       <div className="text-muted-foreground text-xs">{event.city}</div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={event.visibility === 'Public' ? 'default' : 'secondary'}
//                       className={
//                         event.visibility === 'Public'
//                           ? 'bg-primary/10 text-primary text-xs'
//                           : 'bg-muted text-foreground text-xs'
//                       }
//                     >
//                       {event.visibility}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={event.isPremium ? 'default' : 'outline'}
//                       className={
//                         event.isPremium
//                           ? 'bg-primary/10 text-primary text-xs'
//                           : 'border-border text-muted-foreground text-xs'
//                       }
//                     >
//                       {event.isPremium ? 'Premium' : 'Standard'}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       className={
//                         event.status === 'approved'
//                           ? 'bg-success/10 text-success text-xs'
//                           : event.status === 'cancelled'
//                           ? 'bg-destructive/10 text-destructive text-xs'
//                           : event.status === 'completed'
//                           ? 'bg-primary/10 text-primary text-xs'
//                           : 'bg-warning/10 text-warning text-xs'
//                       }
//                     >
//                       {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 border-border hover:bg-muted"
//                           >
//                             <Eye className="h-4 w-4 text-muted-foreground" />
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
//                           <DialogHeader>
//                             <DialogTitle className="text-xl font-semibold text-foreground">
//                               {event.title}
//                             </DialogTitle>
//                           </DialogHeader>
//                           <div className="grid grid-cols-1 gap-4 py-2">
//                             <div className="relative h-32 rounded-lg overflow-hidden">
//                               <img
//                                 src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
//                                 alt={event.title}
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   e.currentTarget.src = '/assets/images/event-placeholder.jpg';
//                                 }}
//                               />
//                               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
//                                 <p className="text-white text-xs font-medium">{event.type}</p>
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Calendar className="h-3 w-3 text-primary" />
//                                     Date & Time
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p>
//                                     <span className="font-medium">Start:</span>{' '}
//                                     {format(new Date(event.startDate), 'MMM dd, yyyy')} at{' '}
//                                     {event.startTime}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">End:</span>{' '}
//                                     {format(new Date(event.endDate), 'MMM dd, yyyy')} at{' '}
//                                     {event.endTime}
//                                   </p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <MapPin className="h-3 w-3 text-primary" />
//                                     Venue
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p className="font-medium">{event.venueName}</p>
//                                   <p>{event.city}</p>
//                                   <p className="text-xs text-muted-foreground">{event.venueAddress}</p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Ticket className="h-3 w-3 text-primary" />
//                                     Tickets
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2">
//                                   <div className="flex flex-wrap gap-1">
//                                     {event.tickets.length > 0 ? (
//                                       event.tickets.map((ticket, index) => (
//                                         <Badge
//                                           key={index}
//                                           variant="secondary"
//                                           className="bg-primary/10 text-primary text-xs"
//                                         >
//                                           {ticket.type} (${ticket.price})
//                                         </Badge>
//                                       ))
//                                     ) : (
//                                       <Badge variant="outline" className="text-xs">
//                                         No Tickets Available
//                                       </Badge>
//                                     )}
//                                   </div>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-border/60 bg-muted/30 shadow-none">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
//                                     <Users className="h-3 w-3 text-primary" />
//                                     Details
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-muted-foreground">
//                                   <p>
//                                     <span className="font-medium">Age Restriction:</span>{' '}
//                                     {event.ageRestriction ? 'Yes' : 'No'}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">Visibility:</span>{' '}
//                                     {event.visibility}
//                                   </p>
//                                   <p>
//                                     <span className="font-medium">Premium:</span>{' '}
//                                     {event.isPremium ? 'Yes' : 'No'}
//                                   </p>
//                                 </CardContent>
//                               </Card>
//                             </div>
//                             <div className="flex justify-end gap-2 mt-2">
//                               <Button
//                                 variant="outline"
//                                 onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
//                                 disabled={event.status === 'cancelled'}
//                                 className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
//                               >
//                                 <X className="h-3 w-3 mr-1" />
//                                 Reject
//                               </Button>
//                               <Button
//                                 onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
//                                 disabled={event.status === 'approved'}
//                                 className="bg-primary hover:bg-primary text-white text-xs py-1 px-2"
//                               >
//                                 <Check className="h-3 w-3 mr-1" />
//                                 Approve
//                               </Button>
//                             </div>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
//                         disabled={event.status === 'approved'}
//                         className="text-success border-success/40 hover:bg-success/5 text-xs py-1 px-2"
//                       >
//                         <Check className="h-3 w-3 mr-1" />
//                         Approve
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
//                         disabled={event.status === 'cancelled'}
//                         className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
//                       >
//                         <X className="h-3 w-3 mr-1" />
//                         Reject
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {showConfirm && (
//         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ease-in-out" style={{ opacity: showConfirm ? 1 : 0 }}>
//           <div className="bg-card p-4 rounded-lg shadow-lg w-96 transform transition-all duration-300 ease-in-out" style={{ transform: showConfirm ? 'scale(1)' : 'scale(0.7)' }}>
//             <h3 className="text-lg font-semibold text-foreground">Confirm Action</h3>
//             <p className="text-sm text-muted-foreground mt-2">Are you sure?</p>
//             <div className="flex justify-end gap-2 mt-4">
//               <Button
//                 variant="outline"
//                 onClick={handleCancelAction}
//                 className="text-muted-foreground border-input hover:bg-muted text-xs py-1 px-2"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleConfirmAction}
//                 className="bg-primary hover:bg-primary text-white text-xs py-1 px-2"
//               >
//                 Confirm
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Check, Eye, Search, X, Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import eventManagement from '../../../services/admin/eventMangement';
import { PageHeader } from '../../common/PageHeader';

// Ticket interface
interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

// Event interface
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
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ action: 'approve' | 'reject' | null; eventId: string } | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await eventManagement.getAllEvents();
        // Transform fetched events to match the Event interface
        const transformedEvents: Event[] = fetchedEvents.map((event) => ({
          ...event,
          status: event.status === 'approve' ? 'approved' : event.status,
        }));
        setEvents(transformedEvents);
      } catch (err) {
        setError('Failed to load events. Please try again.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search term
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to approve an event
  const handleApproveEvent = async (eventId: string) => {
    try {
      await eventManagement.approveEvent(eventId);
      setEvents(
        events.map((event) =>
          event.id === eventId ? { ...event, status: 'approved' } : event
        )
      );
    } catch (error) {
      alert('Failed to approve event. Please try again.');
      console.error('Error approving event:', error);
    }
  };

  // Function to reject/cancel an event
  const handleRejectEvent = async (eventId: string) => {
    try {
      await eventManagement.unapproveEvent(eventId);
      setEvents(
        events.map((event) =>
          event.id === eventId ? { ...event, status: 'cancelled' } : event
        )
      );
    } catch (error) {
      alert('Failed to reject event. Please try again.');
      console.error('Error rejecting event:', error);
    }
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (showConfirm) {
      if (showConfirm.action === 'approve') {
        handleApproveEvent(showConfirm.eventId);
      } else if (showConfirm.action === 'reject') {
        handleRejectEvent(showConfirm.eventId);
      }
      setShowConfirm(null);
    }
  };

  // Handle cancel confirmation
  const handleCancelAction = () => {
    setShowConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-lg font-semibold text-destructive">{error}</div>;
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Event management"
        description="Review, approve, and moderate community events before they go live."
        actions={
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
            {events.length} events
          </Badge>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events by title, organizer, or city..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="py-4 text-muted-foreground">
              List of events requiring moderation
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden lg:table-cell">Visibility</TableHead>
                <TableHead className="hidden lg:table-cell">Premium</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative w-12 h-12 rounded-md overflow-hidden cursor-pointer">
                            <img
                              src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/event-placeholder.jpg';
                              }}
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                              {event.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4 py-2">
                            <div className="relative h-32 rounded-lg overflow-hidden">
                              <img
                                src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/images/event-placeholder.jpg';
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                <p className="text-white text-xs font-medium">{event.type}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    Date & Time
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p>
                                    <span className="font-medium">Start:</span>{' '}
                                    {format(new Date(event.startDate), 'MMM dd, yyyy')} at{' '}
                                    {event.startTime}
                                  </p>
                                  <p>
                                    <span className="font-medium">End:</span>{' '}
                                    {format(new Date(event.endDate), 'MMM dd, yyyy')} at{' '}
                                    {event.endTime}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <MapPin className="h-3 w-3 text-primary" />
                                    Venue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p className="font-medium">{event.venueName}</p>
                                  <p>{event.city}</p>
                                  <p className="text-xs text-muted-foreground">{event.venueAddress}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Ticket className="h-3 w-3 text-primary" />
                                    Tickets
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                  <div className="flex flex-wrap gap-1">
                                    {event.tickets.length > 0 ? (
                                      event.tickets.map((ticket, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="bg-primary/10 text-primary text-xs"
                                        >
                                          {ticket.type} (${ticket.price})
                                        </Badge>
                                      ))
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        No Tickets Available
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Users className="h-3 w-3 text-primary" />
                                    Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p>
                                    <span className="font-medium">Age Restriction:</span>{' '}
                                    {event.ageRestriction ? 'Yes' : 'No'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Visibility:</span>{' '}
                                    {event.visibility}
                                  </p>
                                  <p>
                                    <span className="font-medium">Premium:</span>{' '}
                                    {event.isPremium ? 'Yes' : 'No'}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
                                disabled={event.status === 'cancelled'}
                                className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
                                disabled={event.status === 'approved'}
                                className="bg-primary hover:bg-primary text-white text-xs py-1 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="font-medium text-foreground text-sm">{event.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={event.userImage || '/assets/images/user-placeholder.jpg'}
                          alt={event.userName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {event.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground text-sm">{event.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="bg-primary/5 text-primary text-xs">
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
                      <div className="text-muted-foreground text-xs">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>{event.venueName}</div>
                      <div className="text-muted-foreground text-xs">{event.city}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant={event.visibility === 'Public' ? 'default' : 'secondary'}
                      className={
                        event.visibility === 'Public'
                          ? 'bg-primary/10 text-primary text-xs'
                          : 'bg-muted text-foreground text-xs'
                      }
                    >
                      {event.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant={event.isPremium ? 'default' : 'outline'}
                      className={
                        event.isPremium
                          ? 'bg-primary/10 text-primary text-xs'
                          : 'border-border text-muted-foreground text-xs'
                      }
                    >
                      {event.isPremium ? 'Premium' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        event.status === 'approved'
                          ? 'bg-success/10 text-success text-xs'
                          : event.status === 'cancelled'
                          ? 'bg-destructive/10 text-destructive text-xs'
                          : event.status === 'completed'
                          ? 'bg-primary/10 text-primary text-xs'
                          : 'bg-warning/10 text-warning text-xs'
                      }
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border hover:bg-muted"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                              {event.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4 py-2">
                            <div className="relative h-32 rounded-lg overflow-hidden">
                              <img
                                src={event.mainBanner || '/assets/images/event-placeholder.jpg'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/images/event-placeholder.jpg';
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                <p className="text-white text-xs font-medium">{event.type}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    Date & Time
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p>
                                    <span className="font-medium">Start:</span>{' '}
                                    {format(new Date(event.startDate), 'MMM dd, yyyy')} at{' '}
                                    {event.startTime}
                                  </p>
                                  <p>
                                    <span className="font-medium">End:</span>{' '}
                                    {format(new Date(event.endDate), 'MMM dd, yyyy')} at{' '}
                                    {event.endTime}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <MapPin className="h-3 w-3 text-primary" />
                                    Venue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p className="font-medium">{event.venueName}</p>
                                  <p>{event.city}</p>
                                  <p className="text-xs text-muted-foreground">{event.venueAddress}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Ticket className="h-3 w-3 text-primary" />
                                    Tickets
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                  <div className="flex flex-wrap gap-1">
                                    {event.tickets.length > 0 ? (
                                      event.tickets.map((ticket, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="bg-primary/10 text-primary text-xs"
                                        >
                                          {ticket.type} (${ticket.price})
                                        </Badge>
                                      ))
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        No Tickets Available
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="border-border/60 bg-muted/30 shadow-none">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-foreground">
                                    <Users className="h-3 w-3 text-primary" />
                                    Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                  <p>
                                    <span className="font-medium">Age Restriction:</span>{' '}
                                    {event.ageRestriction ? 'Yes' : 'No'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Visibility:</span>{' '}
                                    {event.visibility}
                                  </p>
                                  <p>
                                    <span className="font-medium">Premium:</span>{' '}
                                    {event.isPremium ? 'Yes' : 'No'}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
                                disabled={event.status === 'cancelled'}
                                className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
                                disabled={event.status === 'approved'}
                                className="bg-primary hover:bg-primary text-white text-xs py-1 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
                        disabled={event.status === 'approved'}
                        className="text-success border-success/40 hover:bg-success/5 text-xs py-1 px-2"
                      >
                        <Check className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
                        disabled={event.status === 'cancelled'}
                        className="text-destructive border-destructive/40 hover:bg-destructive/5 text-xs py-1 px-2"
                      >
                        <X className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showConfirm && (
        <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
          <DialogContent className="sm:max-w-[440px] p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Confirm {showConfirm.action === 'approve' ? 'Approval' : 'Rejection'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to {showConfirm.action === 'approve' ? 'approve' : 'reject'} this event?
                This action will update the event status to{' '}
                {showConfirm.action === 'approve' ? '"Approved"' : '"Cancelled"'}.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAction}
                className="text-muted-foreground border-input hover:bg-muted text-sm py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={
                  showConfirm.action === 'approve'
                    ? 'bg-success hover:bg-success text-white text-sm py-2 px-4'
                    : 'bg-destructive hover:bg-destructive text-white text-sm py-2 px-4'
                }
              >
                {showConfirm.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}