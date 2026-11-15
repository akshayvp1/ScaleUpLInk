// src/components/PaymentFailed.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { XCircle, AlertTriangle, ArrowLeftCircle, RefreshCcw, HelpCircle } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { api } from '../../utils/axiosInterceptor';

const SimpleAccordion: React.FC<{
  items: Array<{ title: string; content: string }>;
}> = ({ items }) => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-border rounded-md overflow-hidden">
          <button
            className="w-full p-4 flex justify-between items-center text-left text-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => toggleItem(index)}
          >
            <span className="font-medium">{item.title}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${openItem === index ? 'rotate-180' : ''}`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {openItem === index && (
            <div className="p-4 pt-0 text-muted-foreground bg-card border-t border-border">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface ErrorDetails {
  code: string;
  message: string;
  resolution: string;
}

interface Event {
  id: string;
  eventTitle: string;
  eventType: string;
  startDate: string;
  startTime: string;
  mainBanner: string;
}

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get('payment_id') || '';
  const eventId = searchParams.get('event_id') || '';
  const errorCode = searchParams.get('error_code') || 'unknown';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const eventResponse = await api.shared.get(`/events/${eventId}`);
        setEvent(eventResponse.data);

        // Mock error messages (replace with API call if you have an endpoint)
        const errorMessages: { [key: string]: ErrorDetails } = {
          'card_declined': {
            code: 'card_declined',
            message: 'Your card was declined. Please try another payment method.',
            resolution: 'Check your card details or use a different payment method.',
          },
          'insufficient_funds': {
            code: 'insufficient_funds',
            message: 'Your card has insufficient funds to complete this purchase.',
            resolution: 'Please try another card or add funds to your account.',
          },
          'expired_card': {
            code: 'expired_card',
            message: 'Your card has expired.',
            resolution: 'Please update your card information or use a different card.',
          },
          'authentication_required': {
            code: 'authentication_required',
            message: 'This transaction requires authentication.',
            resolution: 'Try again and follow the authentication steps when prompted.',
          },
          'cancelled': {
            code: 'cancelled',
            message: 'The payment was cancelled.',
            resolution: 'Please try again to complete your purchase.',
          },
          'unknown': {
            code: 'unknown',
            message: 'An unknown error occurred during the payment process.',
            resolution: 'Please try again or contact our support team for assistance.',
          },
        };

        setErrorDetails(errorMessages[errorCode] || errorMessages.unknown);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId, errorCode]);

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

  const faqItems = [
    {
      title: 'Was my payment processed?',
      content: 'No, your payment was not processed. Your card will not be charged for failed transactions.',
    },
    {
      title: 'Are my tickets still reserved?',
      content: 'No, tickets are only reserved once payment is successful. Please try again to secure your spot.',
    },
    {
      title: 'What should I do next?',
      content: 'You can try again with a different payment method, or contact our support team if you continue to experience issues.',
    },
  ];

  return (
    <div className="min-h-dvh w-full bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6 overflow-hidden border-border/70 shadow-soft">
          <div className="h-1 w-full bg-destructive"></div>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground [font-family:var(--font-display)]">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">
              We were unable to process your payment for this event.
            </p>
            {errorDetails && (
              <div className="mx-auto mb-6 inline-block max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 font-medium text-destructive">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-bold">{errorDetails.code.replace('_', ' ')}</span>
                </div>
                <p className="text-sm">{errorDetails.message}</p>
                <p className="text-sm mt-2">{errorDetails.resolution}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Reference ID: <span className="font-medium">{paymentId}</span>
            </p>
          </CardContent>
        </Card>

        {event && (
          <Card className="mb-6 overflow-hidden border-border/70 shadow-soft">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <img
                  src={event.mainBanner}
                  alt={event.eventTitle}
                  className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{event.eventTitle}</h3>
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {event.eventType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your tickets are not reserved. Please try again to secure your spot.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border p-4 flex flex-wrap gap-3 justify-between">
              <Button
                variant="outline"
                className="border-border text-foreground"
                onClick={() => navigate(-1)}
              >
                <ArrowLeftCircle className="h-4 w-4 mr-2" />
                Back to Checkout
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate(`/checkout?event=${eventId}`)}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="overflow-hidden border-border/70 shadow-soft">
          <CardHeader className="border-b border-border p-4">
            <CardTitle className="text-lg font-semibold flex items-center text-foreground">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <SimpleAccordion items={faqItems} />
            <Separator className="my-6" />
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Need help with your payment?</p>
              <Button variant="link" className="text-primary hover:text-primary">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;