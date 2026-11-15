// src/pages/Checkout.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Calendar,
  MapPin,
  Clock,
  Armchair,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import StripeService from "../../services/stripe/stripeService";
import seatService, { Seat } from "../../services/seat/seatServics";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as
  | string
  | undefined;
if (!stripePublishableKey) {
  throw new Error(
    "VITE_STRIPE_PUBLIC_KEY is not defined in the environment variables.",
  );
}

const stripePromise = loadStripe(stripePublishableKey);

interface EventProps {
  id: string;
  eventTitle: string;
  userName: string;
  userImage: string;
  eventDescription: string;
  eventType:
    | "Conference"
    | "Concert"
    | "Workshop"
    | "Exhibition"
    | "Meetup"
    | "Party";
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime?: string;
  eventVisibility: "Public" | "Private";
  venueName: string;
  venueAddress?: string;
  city: string;
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  createdAt?: string;
  updatedAt?: string;
  capacity?: number;
}

interface CheckoutState {
  event: EventProps;
  selectedSeats: Seat[];
  totalPrice: number;
}

// Countdown showing how long the seat hold is valid. If it hits zero before
// payment completes, the backend will have already released the seats —
// this just makes that visible so the user isn't surprised by a failure.
const HOLD_MINUTES = 5;
const useHoldCountdown = (active: boolean) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(HOLD_MINUTES * 60);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return {
    secondsLeft,
    display: `${mins}:${secs.toString().padStart(2, "0")}`,
  };
};

const CheckoutStep = ({
  title,
  number,
  active,
}: {
  title: string;
  number: number;
  active: boolean;
}) => (
  <div className="flex flex-col items-center">
    <div
      className={cn(
        "mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-background",
        active ? "bg-primary text-white" : "bg-muted text-muted-foreground",
      )}
    >
      {number}
    </div>
    <span
      className={cn(
        "text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {title}
    </span>
  </div>
);

const PaymentForm: React.FC<{
  totalPrice: number;
  onSuccess: (paymentIntentId: string) => void;
}> = ({ totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/confirmation`,
            payment_method_data: {
              billing_details: { name, email },
            },
          },
          redirect: "if_required",
        },
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent?.status === "processing") {
        setError(
          "Your payment is processing. We'll confirm shortly — please don't close this page.",
        );
        setIsLoading(false);
      } else {
        setError("Payment did not succeed.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during payment.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label
            htmlFor="name"
            className="text-sm font-medium text-foreground mb-1 block"
          >
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="border-border focus:border-primary focus:ring-ring"
          />
        </div>
        <div>
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground mb-1 block"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="border-border focus:border-primary focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-1 block">
          Payment Method
        </Label>
        <div className="rounded-xl border border-border bg-card p-3">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </div>

      {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements || !email || !name}
        className="w-full rounded-xl py-6 font-semibold shadow-sm transition-all duration-200 hover:shadow-soft disabled:opacity-70"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [retryPaymentIntentId, setRetryPaymentIntentId] = useState<string | undefined>(undefined);
  const hasInitiatedPayment = useRef(false);
  const hasReleasedSeats = useRef(false);
  const paymentSucceeded = useRef(false);
  const releaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | undefined;

  // Kept in sync via effects below so the unmount-only cleanup effect can
  // read current values without putting them in its dependency array
  // (which would make that effect re-run — and clean up — on every change).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const holdCountdown = useHoldCountdown(!!state && !paymentSucceeded.current);

  useEffect(() => {
    if (
      state &&
      state.event &&
      state.totalPrice &&
      state.selectedSeats.length > 0 &&
      !clientSecret &&
      !hasInitiatedPayment.current
    ) {
      const fetchClientSecret = async () => {
        setIsLoading(true);
        hasInitiatedPayment.current = true;
        try {
          const { clientSecret } = await StripeService.createPaymentIntent(
            state.event.id,
            state.selectedSeats,
            !!retryPaymentIntentId,
            retryPaymentIntentId,
          );
          setClientSecret(clientSecret);
          setActiveStep(2);
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to initialize payment.";
          setError(message);
          hasInitiatedPayment.current = false;
        } finally {
          setIsLoading(false);
        }
      };
      fetchClientSecret();
    }
  }, [state, retryPaymentIntentId, clientSecret]);

  // 1) Hold-expiry watcher — reacts to the countdown hitting zero.
  //    Deliberately has NO cleanup function, so it can never fire from a
  //    dependency change alone — only when secondsLeft actually reaches 0.
  useEffect(() => {
    if (!state || paymentSucceeded.current) return;
    if (holdCountdown.secondsLeft === 0 && !hasReleasedSeats.current) {
      hasReleasedSeats.current = true;
      seatService
        .releaseSeats(
          state.event.id,
          state.selectedSeats.map((s) => s.seatLabel),
        )
        .catch(() => {});
      setError(
        "Your seat hold expired. Please go back and select your seats again.",
      );
    }
  }, [holdCountdown.secondsLeft, state]);

  // 2) Unmount watcher — runs ONLY on real unmount (empty deps), e.g. the
  //    user navigates away or closes the tab mid-checkout. Reads current
  //    values from refs instead of the closure, which is what lets this
  //    effect safely have no dependencies and never re-fire on re-renders.
  useEffect(() => {
    // If StrictMode remounts immediately, cancel the pending release.
    if (releaseTimeoutRef.current) {
      clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }

    return () => {
      releaseTimeoutRef.current = setTimeout(() => {
        if (
          !paymentSucceeded.current &&
          !hasReleasedSeats.current &&
          stateRef.current
        ) {
          hasReleasedSeats.current = true;

          seatService
            .releaseSeats(
              stateRef.current.event.id,
              stateRef.current.selectedSeats.map((s) => s.seatLabel),
            )
            .catch(() => {});
        }
      }, 0);
    };
  }, []);

  if (
    !state ||
    !state.event ||
    !state.selectedSeats ||
    state.selectedSeats.length === 0
  ) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center bg-background">
        <Card className="shadow-lg border-border w-full max-w-md overflow-hidden">
          <div className="bg-primary h-2 w-full" />
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-primary mb-6">
              <AlertCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">No Seats Selected</h2>
            </div>
            <p className="text-muted-foreground mb-8 text-center">
              Please go back and select at least one seat to proceed with
              checkout.
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-6 rounded-md transition-all duration-200 w-full shadow-md hover:shadow-lg"
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

  const { event, selectedSeats, totalPrice } = state;
  const serviceFee = 0;
  const finalTotal = totalPrice + serviceFee;

  // Verifies payment, then flips the held seats to "booked" server-side.
  // On success, redirects to the dedicated booking details page instead of
  // rendering a success card here — that page fetches full ticket/event
  // details from the backend so it works on refresh, too.
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsConfirming(true);
    try {
      const payment = await StripeService.verifyPayment(paymentIntentId);
      if (payment.paymentStatus === "paid") {
        await StripeService.confirmSeatsBooked(
          event.id,
          selectedSeats.map((s) => s.seatLabel),
          payment.bookingId,
        );
        paymentSucceeded.current = true;
        hasReleasedSeats.current = true; // prevent the unmount effect from releasing now-booked seats
        navigate(`/checkout/booking/${payment.bookingId}`, { replace: true });
      } else {
        setError(
          `Payment verification failed. Status: ${payment.paymentStatus}`,
        );
        setRetryPaymentIntentId(paymentIntentId);
        hasInitiatedPayment.current = false;
        setIsConfirming(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to verify payment.";
      setError(message);
      setRetryPaymentIntentId(paymentIntentId);
      hasInitiatedPayment.current = false;
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center bg-background">
        <svg
          className="animate-spin h-10 w-10 text-primary"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-muted-foreground mt-4">Confirming your booking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="group -ml-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground [font-family:var(--font-display)] md:text-3xl">
                Secure Checkout
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete your purchase for {event.eventTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4 relative">
            <div className="absolute top-3 h-0.5 bg-muted w-2/3 z-0"></div>
            <div
              className="absolute top-3 h-0.5 bg-primary z-10"
              style={{ width: `${33.33 * activeStep}%` }}
            ></div>
            <div className="grid grid-cols-3 w-full gap-2 z-20">
              <CheckoutStep title="Seats" number={1} active={activeStep >= 1} />
              <CheckoutStep
                title="Payment"
                number={2}
                active={activeStep >= 2}
              />
              <CheckoutStep
                title="Confirmation"
                number={3}
                active={activeStep >= 3}
              />
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <Badge
              className={cn(
                "text-xs font-medium",
                holdCountdown.secondsLeft <= 60
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-warning/10 text-warning border-warning/20",
              )}
            >
              Seats held for {holdCountdown.display}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-border/70 shadow-soft">
              <div className="h-1 w-full bg-primary"></div>
              <CardHeader className="border-b border-border bg-card p-4">
                <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                  <Armchair className="mr-2 h-5 w-5 text-primary" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <img
                    src={event.mainBanner || "/api/placeholder/800/400"}
                    alt={event.eventTitle}
                    className="h-40 w-full rounded-xl object-cover shadow-sm md:w-40"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {event.eventTitle}
                      </h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {event.eventType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.eventDescription}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <User className="h-4 w-4 text-primary" />
                      <span>Organized by</span>
                      <span className="font-semibold text-foreground">
                        {event.userName || "Event Host"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {format(event.startDate, "EEE, MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {event.startTime}
                          {event.endingTime ? ` - ${event.endingTime}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium truncate">
                          {event.venueName}, {event.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {event.ageRestriction && (
                  <div className="mt-5 flex items-center rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      This event has age restrictions. ID may be required at
                      the venue.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70 shadow-soft">
              <div className="h-1 w-full bg-primary"></div>
              <CardHeader className="border-b border-border bg-card p-4">
                <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                  Payment Information
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Enter your details to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-primary"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      totalPrice={finalTotal}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : (
                  <div className="text-muted-foreground text-center">
                    Initializing payment...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="sticky top-6 overflow-hidden border-border/70 shadow-soft">
              <div className="h-1 w-full bg-primary"></div>
              <CardHeader className="border-b border-border bg-muted/50 p-4">
                <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {selectedSeats.map((seat) => (
                    <div
                      key={seat.seatLabel}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Armchair className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-foreground font-semibold">
                            Seat {seat.seatLabel}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {seat.category}
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">
                        ₹{seat.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Fee</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator className="my-3 bg-muted" />
                  <div className="flex justify-between font-bold text-lg text-foreground">
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