// import React, { useState } from 'react';
// import { Button } from '../../components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../../components/ui/card';
// import { Input } from '../../components/ui/input';
// import { Label } from '../../components/ui/label';
// import { Calendar, MapPin, Clock, Ticket, AlertCircle, CreditCard, ArrowLeft, CheckCircle2, User, LockKeyhole } from 'lucide-react';
// import { format } from 'date-fns';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Separator } from '../../components/ui/separator';
// import { Badge } from '../../components/ui/badge';
// import { Progress } from '../../components/ui/progress';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
// import { cn } from '../../lib/utils';

// interface Ticket {
//   type: string;
//   price: number;
//   quantity: number;
//   description?: string;
//   perks?: string[];
// }

// interface EventProps {
//   id: string;
//   eventTitle: string;
//   userName: string;
//   userImage: string;
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
//   capacity?: number;
// }

// interface CheckoutState {
//   event: EventProps;
//   selectedTickets: Ticket[];
//   totalPrice: number;
// }

// const CheckoutStep = ({ title, number, active }: { title: string; number: number; active: boolean }) => (
//   <div className="flex flex-col items-center">
//     <div className={cn(
//       "w-8 h-8 rounded-full flex items-center justify-center font-medium mb-1",
//       active ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"
//     )}>
//       {number}
//     </div>
//     <span className={cn(
//       "text-xs font-medium",
//       active ? "text-orange-500" : "text-slate-500"
//     )}>
//       {title}
//     </span>
//   </div>
// );

// const Checkout: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [cardNumber, setCardNumber] = useState('');
//   const [expiry, setExpiry] = useState('');
//   const [cvc, setCvc] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [activeStep, setActiveStep] = useState(1);

//   const location = useLocation();
//   const navigate = useNavigate();
//   const state = location.state as CheckoutState | undefined;

//   if (!state || !state.event || !state.selectedTickets || state.selectedTickets.length === 0) {
//     return (
//       <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-orange-50">
//         <Card className="shadow-lg border-slate-100 w-full max-w-md overflow-hidden">
//           <div className="bg-orange-500 h-2 w-full" />
//           <CardContent className="p-8">
//             <div className="flex items-center justify-center gap-2 text-orange-500 mb-6">
//               <AlertCircle className="h-8 w-8" />
//               <h2 className="text-2xl font-bold">No Tickets Selected</h2>
//             </div>
//             <p className="text-slate-600 mb-8 text-center">Please go back and select at least one ticket to proceed with checkout.</p>
//             <Button
//               onClick={() => navigate(-1)}
//               className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 w-full shadow-md hover:shadow-lg"
//               size="lg"
//             >
//               <ArrowLeft className="h-5 w-5 mr-2" />
//               Return to Event Page
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const { event, selectedTickets, totalPrice } = state;
//   const serviceFee = Math.round(totalPrice * 0.05);
//   const finalTotal = totalPrice + serviceFee;

//   const formatCardNumber = (value: string) => {
//     // Remove all non-digits
//     const digits = value.replace(/\D/g, '');
//     // Split into groups of 4 and join with spaces
//     const groups = [];
//     for (let i = 0; i < digits.length && i < 16; i += 4) {
//       groups.push(digits.slice(i, i + 4));
//     }
//     return groups.join(' ');
//   };

//   const formatExpiry = (value: string) => {
//     // Remove all non-digits
//     const digits = value.replace(/\D/g, '');
//     if (digits.length <= 2) return digits;
//     return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
//   };

//   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatCardNumber(e.target.value);
//     setCardNumber(formatted);
//   };

//   const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatExpiry(e.target.value);
//     setExpiry(formatted);
//   };

//   const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const digits = e.target.value.replace(/\D/g, '');
//     setCvc(digits.slice(0, 3));
//   };

//   const isFormValid = email && name && cardNumber.replace(/\s/g, '').length === 16 && 
//                     expiry.length === 5 && cvc.length === 3;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
    
//     // Simulate payment processing
//     setTimeout(() => {
//       setIsLoading(false);
//       // For demo purposes, show an error
//       setError('Payment processing is not implemented in this demo.');
//     }, 1500);
//   };

//   return (
//     <div className="w-full mx-auto bg-gradient-to-b from-white to-orange-50 min-h-screen">
//       <div className="max-w-6xl mx-auto p-4 md:p-6">
//         {/* Header and Progress */}
//         <div className="mb-8">
//           <div className="flex items-center mb-6">
//             <Button
//               onClick={() => navigate(-1)}
//               variant="ghost"
//               className="text-slate-700 hover:bg-orange-100 mr-4 group"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
//               Back
//             </Button>
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Secure Checkout</h1>
//               <p className="text-sm text-slate-500">Complete your purchase for {event.eventTitle}</p>
//             </div>
//           </div>
          
//           {/* Steps Progress */}
//           <div className="flex items-center justify-center mb-8 relative">
//             <div className="absolute top-3 h-0.5 bg-slate-200 w-2/3 z-0"></div>
//             <div className="absolute top-3 h-0.5 bg-orange-500 z-10" style={{ width: `${33.33 * activeStep}%` }}></div>
//             <div className="grid grid-cols-3 w-full gap-2 z-20">
//               <CheckoutStep title="Event" number={1} active={activeStep >= 1} />
//               <CheckoutStep title="Payment" number={2} active={activeStep >= 2} />
//               <CheckoutStep title="Confirmation" number={3} active={activeStep >= 3} />
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="col-span-1 lg:col-span-2 space-y-6">
//             {/* Event Details Card */}
//             <Card className="shadow-lg border-slate-100 overflow-hidden">
//               <div className="bg-orange-500 h-1 w-full"></div>
//               <CardHeader className="bg-white p-4 border-b border-slate-100">
//                 <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
//                   <Ticket className="h-5 w-5 mr-2 text-orange-500" />
//                   Event Details
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-5">
//                 <div className="flex flex-col md:flex-row gap-5">
//                   <img
//                     src={event.mainBanner || '/api/placeholder/800/400'}
//                     alt={event.eventTitle}
//                     className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md"
//                   />
//                   <div className="flex-1">
//                     <div className="flex flex-wrap items-center gap-2 mb-3">
//                       <h3 className="text-xl font-bold text-slate-800">{event.eventTitle}</h3>
//                       <Badge className="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">{event.eventType}</Badge>
//                     </div>
//                     <p className="text-sm text-slate-600 line-clamp-2 mb-3">{event.eventDescription}</p>
//                     <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
//                       <User className="h-4 w-4 text-orange-500" />
//                       <span>Organized by</span>
//                       <span className="font-semibold text-slate-700">{event.userName || 'Event Host'}</span>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
//                       <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
//                         <Calendar className="h-4 w-4 text-orange-500" />
//                         <span className="font-medium">{format(event.startDate, 'EEE, MMM dd, yyyy')}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
//                         <Clock className="h-4 w-4 text-orange-500" />
//                         <span className="font-medium">
//                           {event.startTime}{event.endingTime ? ` - ${event.endingTime}` : ''}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
//                         <MapPin className="h-4 w-4 text-orange-500" />
//                         <span className="font-medium truncate">
//                           {event.venueName}, {event.city}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {event.ageRestriction && (
//                   <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-md flex items-center mt-5 border border-orange-100">
//                     <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
//                     <span>This event has age restrictions. ID may be required at the venue.</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Payment Card */}
//             <Card className="shadow-lg border-slate-100 overflow-hidden">
//               <div className="bg-orange-500 h-1 w-full"></div>
//               <CardHeader className="bg-white p-4 border-b border-slate-100">
//                 <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
//                   <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
//                   Payment Information
//                 </CardTitle>
//                 <CardDescription className="text-sm text-slate-500">
//                   Enter your details to complete the purchase
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-5">
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1 block">
//                         Full Name
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id="name"
//                           type="text"
//                           value={name}
//                           onChange={(e) => setName(e.target.value)}
//                           placeholder="John Doe"
//                           required
//                           className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
//                         />
//                         <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1 block">
//                         Email Address
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id="email"
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           placeholder="your@email.com"
//                           required
//                           className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
//                         />
//                         <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                           <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6">
//                     <div className="flex justify-between items-center mb-1">
//                       <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700">
//                         Card Number
//                       </Label>
//                       <div className="flex items-center gap-2">
//                         <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <rect width="24" height="24" rx="4" fill="#1A1F71"/>
//                           <path d="M9.5 15h-6L7 9h6l-3.5 6z" fill="#FFFFFF"/>
//                           <path d="M17.5 9h-6L8 15h6l3.5-6z" fill="#FFFFFF"/>
//                         </svg>
//                         <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <rect width="24" height="24" rx="4" fill="#FF5F00"/>
//                           <circle cx="9" cy="12" r="5" fill="#EB001B"/>
//                           <circle cx="15" cy="12" r="5" fill="#F79E1B"/>
//                         </svg>
//                       </div>
//                     </div>
//                     <div className="relative">
//                       <Input
//                         id="cardNumber"
//                         type="text"
//                         value={cardNumber}
//                         onChange={handleCardNumberChange}
//                         placeholder="1234 5678 9012 3456"
//                         maxLength={19}
//                         className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
//                       />
//                       <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-5">
//                     <div>
//                       <Label htmlFor="expiry" className="text-sm font-medium text-slate-700 mb-1 block">
//                         Expiry Date
//                       </Label>
//                       <Input
//                         id="expiry"
//                         type="text"
//                         value={expiry}
//                         onChange={handleExpiryChange}
//                         placeholder="MM/YY"
//                         maxLength={5}
//                         className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
//                       />
//                     </div>
//                     <div>
//                       <div className="flex justify-between items-center mb-1">
//                         <Label htmlFor="cvc" className="text-sm font-medium text-slate-700">
//                           CVC
//                         </Label>
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <span className="cursor-help text-slate-400">
//                                 <AlertCircle className="h-4 w-4" />
//                               </span>
//                             </TooltipTrigger>
//                             <TooltipContent className="bg-slate-800 text-white p-2 text-xs">
//                               <p>The 3-digit security code on the back of your card</p>
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       </div>
//                       <div className="relative">
//                         <Input
//                           id="cvc"
//                           type="text"
//                           inputMode="numeric"
//                           value={cvc}
//                           onChange={handleCvcChange}
//                           placeholder="123"
//                           maxLength={3}
//                           className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
//                         />
//                         <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {error && (
//                     <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-100">
//                       <AlertCircle className="h-5 w-5 flex-shrink-0" />
//                       <span>{error}</span>
//                     </div>
//                   )}
//                 </form>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Order Summary */}
//           <div className="col-span-1">
//             <Card className="shadow-lg border-slate-100 sticky top-6 overflow-hidden">
//               <div className="bg-orange-500 h-1 w-full"></div>
//               <CardHeader className="bg-slate-50 p-4 border-b border-slate-100">
//                 <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
//                   <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500" />
//                   Order Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-5">
//                 <div className="space-y-4">
//                   {selectedTickets.map((ticket, index) => (
//                     <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
//                       <div className="flex items-start gap-3">
//                         <div className="bg-orange-100 p-2 rounded-md">
//                           <Ticket className="h-5 w-5 text-orange-500" />
//                         </div>
//                         <div>
//                           <div className="text-slate-800 font-semibold">
//                             {ticket.type} Ticket{ticket.quantity > 1 ? 's' : ''}
//                           </div>
//                           <div className="text-sm text-slate-500">Qty: {ticket.quantity}</div>
//                           {ticket.description && (
//                             <div className="text-xs text-slate-400 mt-1">{ticket.description}</div>
//                           )}
//                         </div>
//                       </div>
//                       <span className="font-semibold text-slate-800">₹{ticket.price * ticket.quantity}</span>
//                     </div>
//                   ))}
//                 </div>
                
//                 <div className="mt-4 space-y-3 text-sm">
//                   <div className="flex justify-between text-slate-600">
//                     <span>Subtotal</span>
//                     <span>₹{totalPrice}</span>
//                   </div>
//                   <div className="flex justify-between text-slate-600">
//                     <span>Service Fee</span>
//                     <span>₹{serviceFee}</span>
//                   </div>
//                   <Separator className="my-3 bg-slate-200" />
//                   <div className="flex justify-between font-bold text-lg text-slate-800">
//                     <span>Total</span>
//                     <span>₹{finalTotal}</span>
//                   </div>
//                 </div>
//               </CardContent>
//               <CardFooter className="p-5 pt-0">
//                 <div className="space-y-4 w-full">
//                   <Button
//                     type="submit"
//                     onClick={handleSubmit}
//                     disabled={isLoading || !isFormValid}
//                     className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
//                     size="lg"
//                   >
//                     {isLoading ? (
//                       <div className="flex items-center justify-center">
//                         <svg
//                           className="animate-spin h-5 w-5 mr-2 text-white"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           />
//                         </svg>
//                         Processing Payment...
//                       </div>
//                     ) : (
//                       `Complete Payment • ₹${finalTotal}`
//                     )}
//                   </Button>
//                   <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
//                     <LockKeyhole className="h-3 w-3" />
//                     <p>Secured by 256-bit encryption</p>
//                   </div>
//                 </div>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;







import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, MapPin, Clock, Ticket, AlertCircle, CreditCard, ArrowLeft, CheckCircle2, User, LockKeyhole } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { cn } from '../../lib/utils';


interface Ticket {
  type: string;
  price: number;
  quantity: number;
  description?: string;
  perks?: string[];
}

interface EventProps {
  id: string;
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
  capacity?: number;
}

interface CheckoutState {
  event: EventProps;
  selectedTickets: Ticket[];
  totalPrice: number;
}

const CheckoutStep = ({ title, number, active }: { title: string; number: number; active: boolean }) => (
  <div className="flex flex-col items-center">
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center font-medium mb-1",
      active ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"
    )}>
      {number}
    </div>
    <span className={cn(
      "text-xs font-medium",
      active ? "text-orange-500" : "text-slate-500"
    )}>
      {title}
    </span>
  </div>
);

const Checkout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | undefined;

  if (!state || !state.event || !state.selectedTickets || state.selectedTickets.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-orange-50">
        <Card className="shadow-lg border-slate-100 w-full max-w-md overflow-hidden">
          <div className="bg-orange-500 h-2 w-full" />
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-6">
              <AlertCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">No Tickets Selected</h2>
            </div>
            <p className="text-slate-600 mb-8 text-center">Please go back and select at least one ticket to proceed with checkout.</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 w-full shadow-md hover:shadow-lg"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Return to Event Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { event, selectedTickets, totalPrice } = state;
  // Updated service fee to be zero
  const serviceFee = 0;
  const finalTotal = totalPrice + serviceFee;

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Split into groups of 4 and join with spaces
    const groups = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join(' ');
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setCvc(digits.slice(0, 3));
  };

  const isFormValid = email && name && cardNumber.replace(/\s/g, '').length === 16 && 
                    expiry.length === 5 && cvc.length === 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, show an error
      setError('Payment processing is not implemented in this demo.');
    }, 1500);
  };

  return (
    <div className="w-full mx-auto bg-gradient-to-b from-white to-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header and Progress */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="text-slate-700 hover:bg-orange-100 mr-4 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Secure Checkout</h1>
              <p className="text-sm text-slate-500">Complete your purchase for {event.eventTitle}</p>
            </div>
          </div>
          
          {/* Steps Progress */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute top-3 h-0.5 bg-slate-200 w-2/3 z-0"></div>
            <div className="absolute top-3 h-0.5 bg-orange-500 z-10" style={{ width: `${33.33 * activeStep}%` }}></div>
            <div className="grid grid-cols-3 w-full gap-2 z-20">
              <CheckoutStep title="Event" number={1} active={activeStep >= 1} />
              <CheckoutStep title="Payment" number={2} active={activeStep >= 2} />
              <CheckoutStep title="Confirmation" number={3} active={activeStep >= 3} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <Card className="shadow-lg border-slate-100 overflow-hidden">
              <div className="bg-orange-500 h-1 w-full"></div>
              <CardHeader className="bg-white p-4 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
                  <Ticket className="h-5 w-5 mr-2 text-orange-500" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <img
                    src={event.mainBanner || '/api/placeholder/800/400'}
                    alt={event.eventTitle}
                    className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold text-slate-800">{event.eventTitle}</h3>
                      <Badge className="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">{event.eventType}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{event.eventDescription}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <User className="h-4 w-4 text-orange-500" />
                      <span>Organized by</span>
                      <span className="font-semibold text-slate-700">{event.userName || 'Event Host'}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{format(event.startDate, 'EEE, MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">
                          {event.startTime}{event.endingTime ? ` - ${event.endingTime}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="font-medium truncate">
                          {event.venueName}, {event.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {event.ageRestriction && (
                  <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-md flex items-center mt-5 border border-orange-100">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>This event has age restrictions. ID may be required at the venue.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Card */}
            <Card className="shadow-lg border-slate-100 overflow-hidden">
              <div className="bg-orange-500 h-1 w-full"></div>
              <CardHeader className="bg-white p-4 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
                  Payment Information
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Enter your details to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1 block">
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1 block">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700">
                        Card Number
                      </Label>
                      <div className="flex items-center gap-2">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#1A1F71"/>
                          <path d="M9.5 15h-6L7 9h6l-3.5 6z" fill="#FFFFFF"/>
                          <path d="M17.5 9h-6L8 15h6l3.5-6z" fill="#FFFFFF"/>
                        </svg>
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#FF5F00"/>
                          <circle cx="9" cy="12" r="5" fill="#EB001B"/>
                          <circle cx="15" cy="12" r="5" fill="#F79E1B"/>
                        </svg>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="mt-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
                      />
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="expiry" className="text-sm font-medium text-slate-700 mb-1 block">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="cvc" className="text-sm font-medium text-slate-700">
                          CVC
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-slate-400">
                                <AlertCircle className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white p-2 text-xs">
                              <p>The 3-digit security code on the back of your card</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <Input
                          id="cvc"
                          type="text"
                          inputMode="numeric"
                          value={cvc}
                          onChange={handleCvcChange}
                          placeholder="123"
                          maxLength={3}
                          className="border-slate-200 focus:border-orange-500 focus:ring-orange-500 pl-10"
                        />
                        <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-100">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="col-span-1">
            <Card className="shadow-lg border-slate-100 sticky top-6 overflow-hidden">
              <div className="bg-orange-500 h-1 w-full"></div>
              <CardHeader className="bg-slate-50 p-4 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {selectedTickets.map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-md">
                          <Ticket className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-slate-800 font-semibold">
                            {ticket.type} Ticket{ticket.quantity > 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-slate-500">Qty: {ticket.quantity}</div>
                          {ticket.description && (
                            <div className="text-xs text-slate-400 mt-1">{ticket.description}</div>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-800">₹{ticket.price * ticket.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Fee</span>
                    <span>₹{serviceFee}</span>
                  </div>
                  <Separator className="my-3 bg-slate-200" />
                  <div className="flex justify-between font-bold text-lg text-slate-800">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <div className="space-y-4 w-full">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading || !isFormValid}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Payment...
                      </div>
                    ) : (
                      `Complete Payment • ₹${finalTotal}`
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <LockKeyhole className="h-3 w-3" />
                    <p>Secured by 256-bit encryption</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;