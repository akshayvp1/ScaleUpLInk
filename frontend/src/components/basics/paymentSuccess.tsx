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
      <div className="flex min-h-dvh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !purchaseDetails) {
    return (
      <div className="min-h-dvh w-full bg-background p-4 sm:p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg overflow-hidden">
            <div className="bg-destructive h-1 w-full"></div>
            <CardContent className="p-8 text-center">
              <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-destructive text-xl">!</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Details</h2>
              <p className="text-muted-foreground mb-6">{error || 'We couldn’t load your payment details. Please contact support with your payment ID.'}</p>
              <Button
                onClick={() => navigate('/')}
                className="bg-muted hover:bg-muted"
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
    <div className="min-h-dvh w-full bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6 overflow-hidden border-border/70 shadow-soft">
          <div className="h-1 w-full bg-success"></div>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground [font-family:var(--font-display)]">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your ticket order has been confirmed and processed successfully.
            </p>
            <div className="mb-6 inline-block rounded-lg border border-border bg-muted/60 px-4 py-2 font-medium text-foreground">
              Order ID: <span className="text-foreground">{purchaseDetails.bookingId}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <span className="font-medium">{purchaseDetails.email}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 overflow-hidden border-border/70 shadow-soft">
          <div className="h-1 w-full bg-primary"></div>
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-foreground">{purchaseDetails.event.eventTitle}</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {purchaseDetails.event.eventType}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(purchaseDetails.event.startDate), 'EEEE, MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {purchaseDetails.event.startTime}
                      {purchaseDetails.event.endingTime && ` - ${purchaseDetails.event.endingTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      {purchaseDetails.event.venueName}, {purchaseDetails.event.city}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Ticket Details</h4>
                  {purchaseDetails.tickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between rounded-lg border border-border bg-muted/50 p-3 text-foreground">
                      <span>
                        {ticket.quantity} x {ticket.type}
                      </span>
                      <span className="font-medium">₹{ticket.price * ticket.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-foreground pt-2">
                    <span>Total Paid</span>
                    <span>₹{purchaseDetails.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/50 p-4 md:w-1/3">
                {purchaseDetails.tickets[0]?.uniqueQrCode ? (
                  <img
                    src={purchaseDetails.tickets[0].uniqueQrCode}
                    alt="Ticket QR Code"
                    className="w-40 h-40"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">QR Code not available</p>
                )}
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Show this QR code at the venue entrance
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border p-4 flex flex-wrap gap-3 justify-center sm:justify-end">
            <Button variant="outline" className="border-border text-foreground">
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="border-border text-foreground">
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
            className="flex-1 bg-card border-border text-foreground hover:bg-muted"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
          <Button
            onClick={() => navigate(`/events/${purchaseDetails.event.id}`)}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
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