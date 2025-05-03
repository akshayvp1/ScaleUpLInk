



// src/pages/Checkout.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Calendar, MapPin, Clock, Ticket, AlertCircle, ArrowLeft, CheckCircle2, User } from "lucide-react";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements,PaymentElement, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StripeService from "../../services/stripe/stripeService";

// Validate Stripe publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
if (!stripePublishableKey) {
  throw new Error("VITE_STRIPE_PUBLIC_KEY is not defined in the environment variables.");
}

// Initialize Stripe
const stripePromise = loadStripe(stripePublishableKey);

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  description?: string;
  perks?: string[];
  usedTickets?: number;
  totalPrice?: number;
  uniqueId?: string;
  uniqueQrCode?: string;
  status?: "active" | "used" | "cancelled";
}

interface EventProps {
  id: string;
  eventTitle: string;
  userName: string;
  userImage: string;
  eventDescription: string;
  eventType: "Conference" | "Concert" | "Workshop" | "Exhibition" | "Meetup" | "Party";
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime?: string;
  eventVisibility: "Public" | "Private";
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

interface Payment {
  bookingId: string;
  userId: string;
  eventId: string;
  tickets: Ticket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

const CheckoutStep = ({ title, number, active }: { title: string; number: number; active: boolean }) => (
  <div className="flex flex-col items-center">
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-medium mb-1",
        active ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"
      )}
    >
      {number}
    </div>
    <span className={cn("text-xs font-medium", active ? "text-orange-500" : "text-slate-500")}>
      {title}
    </span>
  </div>
);

const PaymentForm: React.FC<{
  clientSecret: string;
  totalPrice: number;
  onSuccess: (paymentIntentId: string) => void;
}> = ({ clientSecret, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet.");
      setIsLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        setError("Payment did not succeed.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during payment.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1 block">
            Full Name
          </Label>
          <Input
            id="name"
            type="useRef"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1 block">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1 block">Card Information</Label>
        <div className="border border-slate-200 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements || !email || !name}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
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
          `Pay ₹${totalPrice.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [retryPaymentIntentId, setRetryPaymentIntentId] = useState<string | undefined>(undefined);
  const hasInitiatedPayment = useRef(false); // Use useRef to track payment initiation
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | undefined;
  console.log(retryPaymentIntentId,"daaaa")
  useEffect(() => {
    if (
      state &&
      state.event &&
      state.totalPrice &&
      state.selectedTickets.length > 0 &&
      !clientSecret &&
      !hasInitiatedPayment.current
    ) {
      const fetchClientSecret = async () => {
        setIsLoading(true);
        hasInitiatedPayment.current = true; // Prevent re-trigger
        try {
          
          const { clientSecret } = await StripeService.createPaymentIntent(
            state.event.id,
            state.totalPrice,
            state.selectedTickets,
            !!retryPaymentIntentId,
            retryPaymentIntentId
          );
          setClientSecret(clientSecret);
          setActiveStep(2);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to initialize payment.";
          setError(message);
          hasInitiatedPayment.current = false; // Allow retry on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchClientSecret();
    }
  }, [state, retryPaymentIntentId, clientSecret]);

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
            <p className="text-slate-600 mb-8 text-center">
              Please go back and select at least one ticket to proceed with checkout.
            </p>
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
  const serviceFee = 0;
  const finalTotal = totalPrice + serviceFee;

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const payment = await StripeService.verifyPayment(paymentIntentId);
      if (payment.paymentStatus === "paid") {
        setPaymentSuccess(true);
        setActiveStep(3);
      } else {
        setError(`Payment verification failed. Status: ${payment.paymentStatus}`);
        setRetryPaymentIntentId(paymentIntentId);
        hasInitiatedPayment.current = false; // Allow retry
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to verify payment.";
      setError(message);
      setRetryPaymentIntentId(paymentIntentId);
      hasInitiatedPayment.current = false; // Allow retry
    }
  };

  if (paymentSuccess) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-orange-50">
        <Card className="shadow-lg border-slate-100 w-full max-w-md overflow-hidden">
          <div className="bg-orange-500 h-2 w-full" />
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Payment Successful!</h2>
            <p className="text-slate-600 mb-8">
              Your tickets for {event.eventTitle} have been confirmed. Check your email for details.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-md transition-all duration-200 w-full shadow-md hover:shadow-lg"
              size="lg"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-gradient-to-b from-white to-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
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

          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute top-3 h-0.5 bg-slate-200 w-2/3 z-0"></div>
            <div
              className="absolute top-3 h-0.5 bg-orange-500 z-10"
              style={{ width: `${33.33 * activeStep}%` }}
            ></div>
            <div className="grid grid-cols-3 w-full gap-2 z-20">
              <CheckoutStep title="Event" number={1} active={activeStep >= 1} />
              <CheckoutStep title="Payment" number={2} active={activeStep >= 2} />
              <CheckoutStep title="Confirmation" number={3} active={activeStep >= 3} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
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
                    src={event.mainBanner || "/api/placeholder/800/400"}
                    alt={event.eventTitle}
                    className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold text-slate-800">{event.eventTitle}</h3>
                      <Badge className="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">
                        {event.eventType}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{event.eventDescription}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <User className="h-4 w-4 text-orange-500" />
                      <span>Organized by</span>
                      <span className="font-semibold text-slate-700">{event.userName || "Event Host"}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{format(event.startDate, "EEE, MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">
                          {event.startTime}
                          {event.endingTime ? ` - ${event.endingTime}` : ""}
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

            <Card className="shadow-lg border-slate-100 overflow-hidden">
              <div className="bg-orange-500 h-1 w-full"></div>
              <CardHeader className="bg-white p-4 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500" />
                  Payment Information
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Enter your details to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-100">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      totalPrice={finalTotal}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : (
                  <div className="text-slate-600 text-center">
                    Initializing payment...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-md">
                          <Ticket className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-slate-800 font-semibold">
                            {ticket.type} Ticket{ticket.quantity > 1 ? "s" : ""}
                          </div>
                          <div className="text-sm text-slate-500">Qty: {ticket.quantity}</div>
                          {ticket.description && (
                            <div className="text-xs text-slate-400 mt-1">{ticket.description}</div>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-800">₹{(ticket.price * ticket.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Fee</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator className="my-3 bg-slate-200" />
                  <div className="flex justify-between font-bold text-lg text-slate-800">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;