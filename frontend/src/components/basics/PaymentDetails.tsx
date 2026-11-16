// src/pages/PaymentDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Armchair,
  AlertCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import StripeService, {
  BookingTicket,
  FullBookingDetails,
} from "../../services/stripe/stripeService";
import { SuccessToast } from "../../components/ui/toast";

const buildQrPayload = (qrCode: string) => qrCode.trim();

// --- Professional ticket-stub PDF ------------------------------------------
// Each ticket is rendered on its OWN page, sized exactly to the ticket
// (no A4 page, no leftover blank space) — same footprint as a printed
// event ticket: colored body + photo + darker side stub with a QR code,
// separated by a dashed "perforation" line with notch cutouts.

interface TicketTheme {
  primary: [number, number, number];
  stub: [number, number, number];
  text: [number, number, number];
}

const TICKET_THEMES: TicketTheme[] = [
  { primary: [217, 143, 33], stub: [173, 111, 20], text: [255, 255, 255] }, // gold
  { primary: [30, 41, 59], stub: [15, 23, 42], text: [255, 255, 255] }, // navy
  { primary: [249, 115, 22], stub: [194, 84, 13], text: [255, 255, 255] }, // orange
  { primary: [15, 118, 110], stub: [10, 90, 84], text: [255, 255, 255] }, // teal
];

// Ticket page size in mm — a landscape ticket strip, not a full A4 page.
const TICKET_W = 190;
const TICKET_H = 62;

/**
 * Loads a (possibly cross-origin) image URL, crops it to "cover" a target
 * aspect ratio using an offscreen canvas, and returns a base64 JPEG data URL
 * that can be embedded into the PDF without stretching/distorting it.
 */
const loadImageCover = (
  url: string,
  targetW: number,
  targetH: number,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = 4; // render at higher density for crisp print quality
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(targetW * scale);
        canvas.height = Math.round(targetH * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        const imgRatio = img.width / img.height;
        const targetRatio = canvas.width / canvas.height;
        let drawW = canvas.width;
        let drawH = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        if (imgRatio > targetRatio) {
          drawH = canvas.height;
          drawW = drawH * imgRatio;
          offsetX = (canvas.width - drawW) / 2;
        } else {
          drawW = canvas.width;
          drawH = drawW / imgRatio;
          offsetY = (canvas.height - drawH) / 2;
        }
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (err) {
        reject(err as Error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load event image"));
    img.src = url;
  });

const drawTicket = (
  doc: jsPDF,
  eventTitle: string,
  venueLine: string,
  startDateLine: string,
  startTimeLine: string,
  endDateLine: string | null,
  endTimeLine: string | undefined,
  ticket: BookingTicket,
  qrDataUrl: string | undefined,
  eventImageDataUrl: string | undefined,
  bookingId: string,
  theme: TicketTheme,
) => {
  const radius = 3;
  const pad = 5;
  const stubW = 34;
  const gap = 1.6;
  const mainW = TICKET_W - stubW - gap;
  const stubX = TICKET_W - stubW;
  const seamX = mainW + gap / 2;
  const gState = (o: object) =>
    (doc as unknown as { GState: (o: object) => unknown }).GState(o);

  // ----- Base card (this is the only "block" for the main body — the photo,
  // color tint, and text all live on top of it as one connected surface) -----
  doc.setFillColor(...theme.primary);
  doc.roundedRect(0, 0, mainW, TICKET_H, radius, radius, "F");
  doc.setFillColor(...theme.stub);
  doc.roundedRect(stubX, 0, stubW, TICKET_H, radius, radius, "F");

  // ----- Event photo as the full background of the main body -----
  // Inset by a hair so the rounded corners painted above still frame it,
  // instead of the photo's square corners breaking the card's silhouette.
  if (eventImageDataUrl) {
    const inset = 0.9;
    doc.addImage(
      eventImageDataUrl,
      "JPEG",
      inset,
      inset,
      mainW - inset * 2,
      TICKET_H - inset * 2,
      undefined,
      "FAST",
    );

    // Tint the photo with the ticket's theme color so it reads as one
    // cohesive, branded surface rather than a photo pasted next to a block.
    doc.setFillColor(...theme.primary);
    doc.setGState(gState({ opacity: 0.45 }));
    doc.rect(inset, inset, mainW - inset * 2, TICKET_H - inset * 2, "F");
    doc.setGState(gState({ opacity: 1 }));

    // Soft dark scrim toward the bottom so text stays legible over any photo.
    doc.setFillColor(0, 0, 0);
    doc.setGState(gState({ opacity: 0.28 }));
    doc.rect(inset, TICKET_H * 0.42, mainW - inset * 2, TICKET_H * 0.58 - inset, "F");
    doc.setGState(gState({ opacity: 0.18 }));
    doc.rect(inset, TICKET_H * 0.72, mainW - inset * 2, TICKET_H * 0.28 - inset, "F");
    doc.setGState(gState({ opacity: 1 }));
  }

  // Perforation notches + dashed "tear here" seam (drawn after the photo/tint
  // so the seam still reads crisply against whatever sits behind it)
  const notchR = 2.4;
  doc.setFillColor(255, 255, 255);
  doc.circle(seamX, 0, notchR, "F");
  doc.circle(seamX, TICKET_H, notchR, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  const dashable = doc as unknown as {
    setLineDashPattern?: (pattern: number[], phase: number) => void;
  };
  dashable.setLineDashPattern?.([1, 1], 0);
  doc.line(seamX, notchR, seamX, TICKET_H - notchR);
  dashable.setLineDashPattern?.([], 0);

  // ----- Text content, floating directly on the unified photo/color surface -----
  const cx = pad;
  const textW = mainW - pad * 2;
  const cy = pad + 2;

  // Category / seat pill
  const pillLabel = `${ticket.category.toUpperCase()}  •  SEAT ${ticket.seatLabel}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const pillWidth = doc.getTextWidth(pillLabel) + 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx, cy - 3.8, pillWidth, 6.2, 3.1, 3.1, "F");
  doc.setTextColor(...theme.primary);
  doc.text(pillLabel, cx + 4, cy);

  // Anchor the rest of the text block to the bottom so it always sits over
  // the darkened portion of the photo, regardless of title line count.
  let by = TICKET_H - pad;

  // Price (bottom-right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...theme.text);
  doc.text(`Rs. ${ticket.price.toFixed(2)}`, mainW - pad, by, { align: "right" });

  // Ticket / booking id (bottom-left)
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Ticket ${ticket.uniqueId.slice(0, 13)}  •  Booking ${bookingId.slice(0, 8)}`,
    cx,
    by,
  );
  by -= 5.4;

  // Venue
  doc.setFontSize(8.2);
  const venueLines = doc.splitTextToSize(venueLine, textW).slice(0, 2);
  by -= (venueLines.length - 1) * 4.2;
  doc.text(venueLines, cx, by);
  by -= 4.6;

  // End date/time (only if we have it)
  if (endTimeLine) {
    const endLabel =
      endDateLine && endDateLine !== startDateLine
        ? `Ends: ${endDateLine} • ${endTimeLine}`
        : `Ends: ${endTimeLine}`;
    doc.text(endLabel, cx, by);
    by -= 4.6;
  }

  // Start date/time
  doc.text(`Starts: ${startDateLine} • ${startTimeLine}`, cx, by);
  by -= 6;

  // Event title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(eventTitle, textW).slice(0, 2).reverse();
  titleLines.forEach((line: string) => {
    doc.text(line, cx, by);
    by -= 5.2;
  });

  // ----- Stub: QR code + rotated label -----
  const qrSize = 22;
  const qrX = stubX + (stubW - qrSize) / 2;
  const qrY = pad;
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, "F");
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  }

  doc.setTextColor(...theme.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const shortTitle =
    eventTitle.length > 22 ? `${eventTitle.slice(0, 20)}…` : eventTitle;
  doc.text(shortTitle.toUpperCase(), stubX + stubW / 2 + 3, TICKET_H - pad, {
    angle: 90,
    align: "left",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`SEAT ${ticket.seatLabel}`, stubX + stubW / 2 - 3, TICKET_H - pad, {
    angle: 90,
    align: "left",
  });
};

const generateTicketPDF = async (
  booking: FullBookingDetails,
  qrDataUrls: Record<string, string>,
) => {
  // Load & crop the event image once and reuse it across every ticket page.
  let eventImageDataUrl: string | undefined;
  if (booking.event.mainBanner) {
    try {
      const mainW = TICKET_W - 34 - 1.6; // matches the stub width/gap used in drawTicket
      eventImageDataUrl = await loadImageCover(booking.event.mainBanner, mainW, TICKET_H);
    } catch (err) {
      console.warn("Could not embed event image in ticket PDF:", err);
      eventImageDataUrl = undefined;
    }
  }

  const doc = new jsPDF({
    unit: "mm",
    format: [TICKET_W, TICKET_H],
    orientation: "landscape",
  });

  const startDateLine = format(new Date(booking.event.startDate), "dd MMM yyyy");
  const startTimeLine = booking.event.startTime;
  const endDateLine = booking.event.endingDate
    ? format(new Date(booking.event.endingDate), "dd MMM yyyy")
    : null;
  const endTimeLine = booking.event.endingTime;
  const venueLine = booking.event.venueAddress
    ? `${booking.event.venueName}, ${booking.event.city} — ${booking.event.venueAddress}`
    : `${booking.event.venueName}, ${booking.event.city}`;

  booking.tickets.forEach((ticket, index) => {
    if (index > 0) {
      doc.addPage([TICKET_W, TICKET_H], "landscape");
    }
    const theme = TICKET_THEMES[index % TICKET_THEMES.length];
    drawTicket(
      doc,
      booking.event.eventTitle,
      venueLine,
      startDateLine,
      startTimeLine,
      endDateLine,
      endTimeLine,
      ticket,
      qrDataUrls[ticket.uniqueId],
      eventImageDataUrl,
      booking.bookingId,
      theme,
    );
  });

  doc.save(`ticket-${booking.bookingId}.pdf`);
};
// -----------------------------------------------------------------------

const PaymentDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<FullBookingDetails | null>(null);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking reference provided.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const details = await StripeService.getBookingDetails(bookingId);
        if (!cancelled) setBooking(details);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load booking details.";
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    let cancelled = false;

    const generateAll = async () => {
      const entries = await Promise.all(
        booking.tickets.map(async (ticket) => {
          const payload = buildQrPayload(ticket.uniqueQrCode);
          const dataUrl = await QRCode.toDataURL(payload, {
            width: 200,
            margin: 1,
          });
          return [ticket.uniqueId, dataUrl] as const;
        }),
      );
      if (!cancelled) setQrDataUrls(Object.fromEntries(entries));
    };

    generateAll().catch((err) => console.error("Failed to generate QR codes:", err));
    return () => {
      cancelled = true;
    };
  }, [booking]);

  const handleDownload = async () => {
    if (!booking) return;
    setIsDownloading(true);
    try {
      await generateTicketPDF(booking, qrDataUrls);
    } catch (err) {
      console.error("Failed to generate ticket PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center bg-background p-6 py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary motion-reduce:animate-none" />
        <p className="text-muted-foreground mt-4">Loading your ticket details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center bg-background p-6 py-24">
        <Card className="w-full max-w-md overflow-hidden rounded-2xl border-border/70 shadow-soft">
          <div className="h-1.5 w-full bg-destructive" />
          <CardContent className="flex flex-col items-center p-8">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h2 className="mb-2 text-center text-2xl font-bold [font-family:var(--font-display)]">
              Couldn't Load Ticket
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              {error || "We couldn't find details for this booking."}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full rounded-xl py-6 font-semibold"
              size="lg"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = booking.tickets.reduce((sum, t) => sum + t.price, 0);
  const discount = booking.discount ?? 0;

  return (
    <>
      <SuccessToast
        message="Payment successful — your tickets are ready."
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="mx-auto w-full max-w-4xl bg-background p-4 md:p-6">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="group mb-4 rounded-xl text-foreground hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>

        <Card className="w-full overflow-hidden rounded-2xl border-border/70 shadow-soft">
          <div className="h-1.5 w-full bg-primary" />
          <CardContent className="p-5 md:p-8">
            <div className="mb-8 text-center">
              {booking.event.mainBanner && (
                <img
                  src={booking.event.mainBanner}
                  alt={booking.event.eventTitle}
                  className="mb-6 h-48 w-full rounded-xl object-cover shadow-sm md:h-56"
                />
              )}
              <h2 className="mb-2 text-2xl font-bold text-foreground [font-family:var(--font-display)] md:text-3xl">
                {booking.event.eventTitle}
              </h2>
              <p className="text-muted-foreground">Your tickets are confirmed</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Booking ID: {booking.bookingId}
              </p>
              <Badge className="mt-2 border-success/20 bg-success/10 text-success">
                {booking.paymentStatus}
              </Badge>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              {booking.event.eventDescription}
            </p>

            <div className="mb-8 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3 text-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">
                  {format(new Date(booking.event.startDate), "EEE, MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3 text-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">
                  {booking.event.startTime}
                  {booking.event.endingTime ? ` - ${booking.event.endingTime}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3 text-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">
                  {booking.event.venueName}, {booking.event.city}
                </span>
              </div>
            </div>

            {booking.event.venueAddress && (
              <p className="mb-6 text-center text-xs text-muted-foreground">
                {booking.event.venueAddress}
              </p>
            )}

            {booking.event.ageRestriction && (
              <div className="mb-6 flex items-center rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
                <span>This event has age restrictions. ID may be required at the venue.</span>
              </div>
            )}

            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Tickets ({booking.tickets.length})
            </h3>
            <div className="space-y-4 mb-6">
              {booking.tickets.map((ticket) => (
                <div
                  key={ticket.uniqueId}
                  className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-stretch"
                >
                  <div className="shrink-0 rounded-lg border border-border bg-card p-2">
                    {qrDataUrls[ticket.uniqueId] ? (
                      <img
                        src={qrDataUrls[ticket.uniqueId]}
                        alt={`QR code for seat ${ticket.seatLabel}`}
                        className="w-24 h-24"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-xs text-muted-foreground">
                        Generating…
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Armchair className="h-4 w-4 text-primary" />
                      <span className="text-foreground font-semibold">
                        Seat {ticket.seatLabel}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {ticket.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket ID: {ticket.uniqueId}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1">
                    <span className="font-semibold text-foreground">
                      ₹{ticket.price.toFixed(2)}
                    </span>
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>
                    Discount{booking.coupon ? ` (${booking.coupon})` : ""}
                  </span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2 bg-border" />
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total Paid</span>
                <span>₹{booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full rounded-xl py-6 font-semibold shadow-sm"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {isDownloading ? "Preparing your ticket…" : "Download Ticket"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PaymentDetails;