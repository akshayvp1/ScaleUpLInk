
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
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center py-8 text-red-500 text-lg font-semibold">{error}</div>;
//   }

//   return (
//     <div className="w-full px-6 py-8 space-y-6 bg-gray-50 min-h-screen relative">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-900">Event Management Dashboard</h1>
//       </div>

//       <div className="flex items-center space-x-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <Input
//             placeholder="Search events by title, organizer, or city..."
//             className="pl-10 py-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <Button
//           variant="outline"
//           className="py-2 border-gray-200 hover:bg-gray-100 rounded-md"
//         >
//           Filter
//         </Button>
//       </div>

//       <Card className="shadow-lg rounded-lg overflow-hidden">
//         <CardContent className="p-0">
//           <Table>
//             <TableCaption className="py-4 text-gray-600">
//               List of events requiring moderation
//             </TableCaption>
//             <TableHeader>
//               <TableRow className="bg-gray-50">
//                 <TableHead className="font-semibold text-gray-700">Event</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Organizer</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Type</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Date</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Location</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Visibility</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Premium</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Status</TableHead>
//                 <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredEvents.map((event) => (
//                 <TableRow key={event.id} className="hover:bg-gray-50">
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
//                         <DialogContent className="max-w-2xl p-4 bg-white rounded-lg">
//                           <DialogHeader>
//                             <DialogTitle className="text-xl font-semibold text-gray-900">
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Calendar className="h-3 w-3 text-blue-600" />
//                                     Date & Time
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <MapPin className="h-3 w-3 text-blue-600" />
//                                     Venue
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
//                                   <p className="font-medium">{event.venueName}</p>
//                                   <p>{event.city}</p>
//                                   <p className="text-xs text-gray-500">{event.venueAddress}</p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Ticket className="h-3 w-3 text-blue-600" />
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
//                                           className="bg-blue-100 text-blue-800 text-xs"
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Users className="h-3 w-3 text-blue-600" />
//                                     Details
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
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
//                                 className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
//                               >
//                                 <X className="h-3 w-3 mr-1" />
//                                 Reject
//                               </Button>
//                               <Button
//                                 onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
//                                 disabled={event.status === 'approved'}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
//                               >
//                                 <Check className="h-3 w-3 mr-1" />
//                                 Approve
//                               </Button>
//                             </div>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                       <div className="font-medium text-gray-800 text-sm">{event.title}</div>
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
//                         <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
//                           {event.userName.substring(0, 2).toUpperCase()}
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className="text-gray-800 text-sm">{event.userName}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs">
//                       {event.type}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-sm text-gray-600">
//                       <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
//                       <div className="text-gray-500 text-xs">
//                         {event.startTime} - {event.endTime}
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-sm text-gray-600">
//                       <div>{event.venueName}</div>
//                       <div className="text-gray-500 text-xs">{event.city}</div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={event.visibility === 'Public' ? 'default' : 'secondary'}
//                       className={
//                         event.visibility === 'Public'
//                           ? 'bg-blue-100 text-blue-800 text-xs'
//                           : 'bg-gray-100 text-gray-800 text-xs'
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
//                           ? 'bg-purple-100 text-purple-800 text-xs'
//                           : 'border-gray-200 text-gray-600 text-xs'
//                       }
//                     >
//                       {event.isPremium ? 'Premium' : 'Standard'}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       className={
//                         event.status === 'approved'
//                           ? 'bg-green-100 text-green-800 text-xs'
//                           : event.status === 'cancelled'
//                           ? 'bg-red-100 text-red-800 text-xs'
//                           : event.status === 'completed'
//                           ? 'bg-blue-100 text-blue-800 text-xs'
//                           : 'bg-amber-100 text-amber-800 text-xs'
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
//                             className="h-8 w-8 border-gray-200 hover:bg-gray-100"
//                           >
//                             <Eye className="h-4 w-4 text-gray-600" />
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-w-2xl p-4 bg-white rounded-lg">
//                           <DialogHeader>
//                             <DialogTitle className="text-xl font-semibold text-gray-900">
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Calendar className="h-3 w-3 text-blue-600" />
//                                     Date & Time
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <MapPin className="h-3 w-3 text-blue-600" />
//                                     Venue
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
//                                   <p className="font-medium">{event.venueName}</p>
//                                   <p>{event.city}</p>
//                                   <p className="text-xs text-gray-500">{event.venueAddress}</p>
//                                 </CardContent>
//                               </Card>
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Ticket className="h-3 w-3 text-blue-600" />
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
//                                           className="bg-blue-100 text-blue-800 text-xs"
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
//                               <Card className="border-none shadow-sm">
//                                 <CardHeader className="p-2">
//                                   <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
//                                     <Users className="h-3 w-3 text-blue-600" />
//                                     Details
//                                   </CardTitle>
//                                 </CardHeader>
//                                 <CardContent className="p-2 text-xs text-gray-600">
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
//                                 className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
//                               >
//                                 <X className="h-3 w-3 mr-1" />
//                                 Reject
//                               </Button>
//                               <Button
//                                 onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
//                                 disabled={event.status === 'approved'}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
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
//                         className="text-green-600 border-green-300 hover:bg-green-50 text-xs py-1 px-2"
//                       >
//                         <Check className="h-3 w-3 mr-1" />
//                         Approve
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
//                         disabled={event.status === 'cancelled'}
//                         className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
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
//           <div className="bg-white p-4 rounded-lg shadow-lg w-96 transform transition-all duration-300 ease-in-out" style={{ transform: showConfirm ? 'scale(1)' : 'scale(0.7)' }}>
//             <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
//             <p className="text-sm text-gray-600 mt-2">Are you sure?</p>
//             <div className="flex justify-end gap-2 mt-4">
//               <Button
//                 variant="outline"
//                 onClick={handleCancelAction}
//                 className="text-gray-600 border-gray-300 hover:bg-gray-50 text-xs py-1 px-2"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleConfirmAction}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
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





import React, { useState, useEffect } from 'react';
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
        const transformedEvents: Event[] = fetchedEvents.map((event: any) => ({
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500 text-lg font-semibold">{error}</div>;
  }

  return (
    <div className="w-full px-6 py-8 space-y-6 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Event Management Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search events by title, organizer, or city..."
            className="pl-10 py-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="py-2 border-gray-200 hover:bg-gray-100 rounded-md"
        >
          Filter
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="py-4 text-gray-600">
              List of events requiring moderation
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Event</TableHead>
                <TableHead className="font-semibold text-gray-700">Organizer</TableHead>
                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                <TableHead className="font-semibold text-gray-700">Visibility</TableHead>
                <TableHead className="font-semibold text-gray-700">Premium</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id} className="hover:bg-gray-50">
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
                        <DialogContent className="max-w-2xl p-4 bg-white rounded-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Calendar className="h-3 w-3 text-blue-600" />
                                    Date & Time
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <MapPin className="h-3 w-3 text-blue-600" />
                                    Venue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
                                  <p className="font-medium">{event.venueName}</p>
                                  <p>{event.city}</p>
                                  <p className="text-xs text-gray-500">{event.venueAddress}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Ticket className="h-3 w-3 text-blue-600" />
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
                                          className="bg-blue-100 text-blue-800 text-xs"
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Users className="h-3 w-3 text-blue-600" />
                                    Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
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
                                className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
                                disabled={event.status === 'approved'}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="font-medium text-gray-800 text-sm">{event.title}</div>
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
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {event.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-800 text-sm">{event.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs">
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
                      <div className="text-gray-500 text-xs">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div>{event.venueName}</div>
                      <div className="text-gray-500 text-xs">{event.city}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.visibility === 'Public' ? 'default' : 'secondary'}
                      className={
                        event.visibility === 'Public'
                          ? 'bg-blue-100 text-blue-800 text-xs'
                          : 'bg-gray-100 text-gray-800 text-xs'
                      }
                    >
                      {event.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.isPremium ? 'default' : 'outline'}
                      className={
                        event.isPremium
                          ? 'bg-purple-100 text-purple-800 text-xs'
                          : 'border-gray-200 text-gray-600 text-xs'
                      }
                    >
                      {event.isPremium ? 'Premium' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        event.status === 'approved'
                          ? 'bg-green-100 text-green-800 text-xs'
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 text-xs'
                          : event.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 text-xs'
                          : 'bg-amber-100 text-amber-800 text-xs'
                      }
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-200 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-4 bg-white rounded-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Calendar className="h-3 w-3 text-blue-600" />
                                    Date & Time
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <MapPin className="h-3 w-3 text-blue-600" />
                                    Venue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
                                  <p className="font-medium">{event.venueName}</p>
                                  <p>{event.city}</p>
                                  <p className="text-xs text-gray-500">{event.venueAddress}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Ticket className="h-3 w-3 text-blue-600" />
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
                                          className="bg-blue-100 text-blue-800 text-xs"
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
                              <Card className="border-none shadow-sm">
                                <CardHeader className="p-2">
                                  <CardTitle className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Users className="h-3 w-3 text-blue-600" />
                                    Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-gray-600">
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
                                className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => setShowConfirm({ action: 'approve', eventId: event.id })}
                                disabled={event.status === 'approved'}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
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
                        className="text-green-600 border-green-300 hover:bg-green-50 text-xs py-1 px-2"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm({ action: 'reject', eventId: event.id })}
                        disabled={event.status === 'cancelled'}
                        className="text-red-600 border-red-300 hover:bg-red-50 text-xs py-1 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
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
          <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirm {showConfirm.action === 'approve' ? 'Approval' : 'Rejection'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to {showConfirm.action === 'approve' ? 'approve' : 'reject'} this event?
                This action will update the event status to{' '}
                {showConfirm.action === 'approve' ? '"Approved"' : '"Cancelled"'}.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAction}
                className="text-gray-600 border-gray-300 hover:bg-gray-50 text-sm py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={
                  showConfirm.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4'
                    : 'bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4'
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