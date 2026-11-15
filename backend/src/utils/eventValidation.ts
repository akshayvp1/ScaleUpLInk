import { EventDocument, ICreateEventDTO, Ticket } from "../interfaces/IEvent";

const EVENT_TYPES = [
  "Conference",
  "Concert",
  "Workshop",
  "Exhibition",
  "Meetup",
  "Party",
] as const;

const VISIBILITIES = ["Public", "Private"] as const;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MAX_EVENT_DURATION_MS = 60 * 24 * 60 * 60 * 1000;

const fail = (message: string): never => {
  throw new Error(message);
};

const toTrimmedString = (value: unknown, label: string, maxLength: number): string => {
  if (typeof value !== "string") fail(`${label} is required`);
  const trimmed = value.trim();
  if (!trimmed) fail(`${label} is required`);
  if (trimmed.length > maxLength) fail(`${label} is too long`);
  return trimmed;
};

const toFiniteNumber = (value: unknown, label: string): number => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) fail(`${label} must be a valid number`);
  return num;
};

export const parseEventDateTime = (
  dateValue: unknown,
  timeValue: unknown
): Date | null => {
  if (typeof timeValue !== "string" || !TIME_PATTERN.test(timeValue.trim())) {
    return null;
  }

  const base = dateValue instanceof Date ? new Date(dateValue) : new Date(String(dateValue));
  if (Number.isNaN(base.getTime())) return null;

  const [hours, minutes] = timeValue.trim().split(":").map(Number);
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours,
    minutes,
    0,
    0
  );
};

export const getEventStartDateTime = (event: {
  startDate: Date | string;
  startTime: string;
}): Date | null => parseEventDateTime(event.startDate, event.startTime);

export const getEventEndDateTime = (event: {
  endingDate: Date | string;
  endingTime?: string;
}): Date | null => {
  if (!event.endingTime) return null;
  return parseEventDateTime(event.endingDate, event.endingTime);
};

export interface BookabilityCheck {
  bookable: boolean;
  reason?: string;
}

export const checkEventBookable = (
  event: Pick<EventDocument, "eventStatus" | "startDate" | "startTime"> & {
    endingDate?: Date;
    endingTime?: string;
  },
  now = new Date()
): BookabilityCheck => {
  if (event.eventStatus === "pending") {
    return { bookable: false, reason: "This event is not available for booking yet." };
  }
  if (event.eventStatus === "cancelled") {
    return { bookable: false, reason: "This event has been cancelled." };
  }
  if (event.eventStatus === "completed") {
    return { bookable: false, reason: "This event has already ended." };
  }

  const start = getEventStartDateTime(event);
  if (!start) {
    return { bookable: false, reason: "This event has an invalid start date." };
  }
  if (start.getTime() <= now.getTime()) {
    return { bookable: false, reason: "This event has already started." };
  }

  const end = getEventEndDateTime({
    endingDate: event.endingDate ?? event.startDate,
    endingTime: event.endingTime,
  });
  if (end && end.getTime() <= now.getTime()) {
    return { bookable: false, reason: "This event has already ended." };
  }

  return { bookable: true };
};

export const assertEventBookable = (
  event: Pick<EventDocument, "eventStatus" | "startDate" | "startTime"> & {
    endingDate?: Date;
    endingTime?: string;
  },
  now = new Date()
): void => {
  const result = checkEventBookable(event, now);
  if (!result.bookable) fail(result.reason ?? "This event is not available for booking.");
};

const normalizeTickets = (value: unknown): Ticket[] => {
  if (!Array.isArray(value) || value.length === 0) {
    fail("At least one ticket type is required");
  }

  const tickets = value.map((raw, index) => {
    const ticket = (raw ?? {}) as Partial<Ticket>;
    const type = toTrimmedString(ticket.type, `Ticket ${index + 1} name`, 80);
    const price = toFiniteNumber(ticket.price, `Ticket ${index + 1} price`);
    const quantity = toFiniteNumber(ticket.quantity, `Ticket ${index + 1} quantity`);

    if (price < 0) fail(`Ticket ${index + 1} price cannot be negative`);
    if (price > 1_000_000) fail(`Ticket ${index + 1} price is too high`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      fail(`Ticket ${index + 1} quantity must be a whole number of at least 1`);
    }
    if (quantity > 1_000_000) fail(`Ticket ${index + 1} quantity is too high`);

    return { type, price, quantity };
  });

  return tickets;
};

/**
 * Validates event creation input on the server. The frontend also validates,
 * but the API must never trust client-side checks.
 */
export const validateEventCreationInput = (
  input: unknown,
  now = new Date()
): ICreateEventDTO => {
  const data = (input ?? {}) as Partial<ICreateEventDTO>;

  const eventTitle = toTrimmedString(data.eventTitle, "Event title", 120);
  const eventDescription = toTrimmedString(
    data.eventDescription,
    "Event description",
    5000
  );
  const eventType = data.eventType;
  if (!eventType || !EVENT_TYPES.includes(eventType)) {
    fail("Please choose a valid event type");
  }
  const eventVisibility = data.eventVisibility ?? "Public";
  if (!VISIBILITIES.includes(eventVisibility)) {
    fail("Please choose a valid event visibility");
  }

  const venueName = toTrimmedString(data.venueName, "Venue name", 200);
  const venueAddress =
    typeof data.venueAddress === "string" && data.venueAddress.trim()
      ? data.venueAddress.trim().slice(0, 300)
      : undefined;
  const city = toTrimmedString(data.city, "City", 100);
  const mainBanner = toTrimmedString(data.mainBanner, "Main banner", 8_000_000);
  const promotionalImage =
    typeof data.promotionalImage === "string" && data.promotionalImage.trim()
      ? data.promotionalImage.trim()
      : undefined;

  if (typeof data.startTime !== "string" || !TIME_PATTERN.test(data.startTime)) {
    fail("Start time must be in HH:mm format");
  }
  if (
    data.endingTime !== undefined &&
    (typeof data.endingTime !== "string" || !TIME_PATTERN.test(data.endingTime))
  ) {
    fail("End time must be in HH:mm format");
  }

  const startDate = new Date(data.startDate as unknown as string);
  const endingDate = new Date(data.endingDate as unknown as string);
  if (Number.isNaN(startDate.getTime())) fail("Start date is invalid");
  if (Number.isNaN(endingDate.getTime())) fail("End date is invalid");

  const startDateTime = parseEventDateTime(startDate, data.startTime);
  const endDateTime = data.endingTime
    ? parseEventDateTime(endingDate, data.endingTime)
    : null;

  if (!startDateTime) fail("Start date and time are invalid");
  if (startDateTime.getTime() <= now.getTime()) {
    fail("The event must start in the future");
  }
  if (endDateTime && endDateTime.getTime() <= startDateTime.getTime()) {
    fail("The event end must be after its start");
  }
  if (
    endDateTime &&
    endDateTime.getTime() - startDateTime.getTime() > MAX_EVENT_DURATION_MS
  ) {
    fail("An event cannot run for more than 60 days");
  }

  const tickets = normalizeTickets(data.tickets);
  if (typeof data.ageRestriction !== "boolean") {
    fail("Age restriction must be true or false");
  }

  return {
    eventTitle,
    eventDescription,
    eventType,
    startDate,
    startTime: data.startTime,
    endingDate,
    endingTime: data.endingTime,
    eventVisibility,
    venueName,
    venueAddress,
    city,
    tickets,
    ageRestriction: data.ageRestriction,
    mainBanner,
    promotionalImage,
  };
};
