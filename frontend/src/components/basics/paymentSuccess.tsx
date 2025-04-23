// src/components/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, Share2, Download, Home } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { api } from '../../utils/axiosInterceptor';

interface PurchaseDetails {
  bookingId: string;
  event: {
    id: string;
    eventTitle: string;
    eventType: string;
    startDate: string;
    startTime: string;
    endingTime?: string;
    venueName: string;
    city: string;
    mainBanner: string;
  };
  paymentId: string;
  amount: number;
  purchaseDate: string;
  email: string;
  tickets: {
    type: string;
    quantity: number;
    price: number;
    uniqueQrCode: string;
  }[];
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get('session_id') || '';
  const eventId = searchParams.get('event_id') || '';

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        setLoading(true);
        // Fetch booking details from your API
        const response = await api.shared.get(`/bookings/${paymentId}`);
        setPurchaseDetails(response.data);
      } catch (err) {
        console.error('Error fetching purchase details:', err);
        setError('Failed to load purchase details. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPurchaseDetails();
    }
  }, [paymentId, eventId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !purchaseDetails) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-orange-50 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg overflow-hidden">
            <div className="bg-red-500 h-1 w-full"></div>
            <CardContent className="p-8 text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Error Loading Details</h2>
              <p className="text-slate-600 mb-6">{error || 'We couldn’t load your payment details. Please contact support with your payment ID.'}</p>
              <Button
                onClick={() => navigate('/')}
                className="bg-slate-800 hover:bg-slate-900"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-orange-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg overflow-hidden mb-6">
          <div className="bg-green-500 h-1 w-full"></div>
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
            <p className="text-slate-600 mb-6">
              Your ticket order has been confirmed and processed successfully.
            </p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium mb-6">
              Order ID: <span className="text-slate-900">{purchaseDetails.bookingId}</span>
            </div>
            <p className="text-sm text-slate-500">
              A confirmation email has been sent to <span className="font-medium">{purchaseDetails.email}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden mb-6">
          <div className="bg-orange-500 h-1 w-full"></div>
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{purchaseDetails.event.eventTitle}</h3>
                  <Badge className="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">
                    {purchaseDetails.event.eventType}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span>{format(new Date(purchaseDetails.event.startDate), 'EEEE, MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>
                      {purchaseDetails.event.startTime}
                      {purchaseDetails.event.endingTime && ` - ${purchaseDetails.event.endingTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span>
                      {purchaseDetails.event.venueName}, {purchaseDetails.event.city}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">Ticket Details</h4>
                  {purchaseDetails.tickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                      <span>
                        {ticket.quantity} x {ticket.type}
                      </span>
                      <span className="font-medium">₹{ticket.price * ticket.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-800 pt-2">
                    <span>Total Paid</span>
                    <span>₹{purchaseDetails.amount}</span>
                  </div>
                </div>
              </div>

              <div className="md:w-1/3 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                {purchaseDetails.tickets[0]?.uniqueQrCode ? (
                  <img
                    src={purchaseDetails.tickets[0].uniqueQrCode}
                    alt="Ticket QR Code"
                    className="w-40 h-40"
                  />
                ) : (
                  <p className="text-sm text-slate-500">QR Code not available</p>
                )}
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Show this QR code at the venue entrance
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 p-4 flex flex-wrap gap-3 justify-center sm:justify-end">
            <Button variant="outline" className="border-slate-200 text-slate-700">
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share with friends</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
          <Button
            onClick={() => navigate(`/events/${purchaseDetails.event.id}`)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            View Event Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;