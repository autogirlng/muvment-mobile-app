import type {
  DriverTrip,
  DriverTripStatus,
} from "../api/types";
import type { BadgeProps } from "../components/common/TripCard";

export interface DriverTripCardModel {
  badges: BadgeProps[];
  clientName: string;
  id: string;
  location: string;
  timeRange: string;
  tripId: string;
  vehicle: string;
}

export interface DriverTripSection {
  data: DriverTripCardModel[];
  title: string;
}

export type DriverTripBookingTimerType = "airport" | "standard" | "full-day";

export const ACTIVE_DRIVER_TRIP_STATUSES: DriverTripStatus[] = [
  "NOT_STARTED",
  "CHECKED_IN",
  "AWAITING_PICKUP",
  "RUNNING_LATE",
  "ONGOING",
  "EXTRA_TIME",
];

const STATUS_LABELS: Record<DriverTripStatus, string> = {
  AWAITING_PICKUP: "AWAITING PICKUP",
  CANCELLED: "CANCELLED",
  CHECKED_IN: "CHECKED IN",
  COMPLETE: "COMPLETE",
  EXTRA_TIME: "EXTRA TIME",
  NOT_STARTED: "NOT STARTED",
  ONGOING: "ONGOING",
  RUNNING_LATE: "RUNNING LATE",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "long",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const compact = (value?: string | null) => value?.trim() || undefined;

const parseDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const getDurationLabel = (duration?: number | null) => {
  if (duration === undefined || duration === null) {
    return undefined;
  }

  return `${duration} hr${duration === 1 ? "" : "s"}`;
};

const getFallbackValue = (value: string | undefined, fallback: string) =>
  value && value.length > 0 ? value : fallback;

const normalizeBookingText = (value?: string | null) =>
  compact(value)?.toLowerCase().replace(/[_-]+/g, " ");

const getBookingDurationHours = (value?: string | null) => {
  const normalizedValue = normalizeBookingText(value);

  if (!normalizedValue) {
    return undefined;
  }

  const hourMatch = normalizedValue.match(
    /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)?$/,
  );

  if (!hourMatch?.[1]) {
    return undefined;
  }

  const hours = Number(hourMatch[1]);

  return Number.isFinite(hours) && hours > 0 ? hours : undefined;
};

const formatBookingDurationBadgeLabel = (hours: number) => {
  const formattedHours = Number.isInteger(hours)
    ? String(hours)
    : String(hours).replace(/\.?0+$/, "");

  return `${formattedHours} HOUR${hours === 1 ? "" : "S"}`;
};

export const isUnaccommodatedHourBookingLabel = (value?: string | null) => {
  const hours = getBookingDurationHours(value);

  return (
    hours !== undefined &&
    hours !== 12 &&
    hours !== 24
  );
};

export const getDriverTripBookingTimerType = (
  value?: string | null,
): DriverTripBookingTimerType => {
  const normalizedValue = normalizeBookingText(value) ?? "";

  if (normalizedValue.includes("airport")) {
    return "airport";
  }

  if (
    normalizedValue.includes("standard") ||
    normalizedValue.includes("12")
  ) {
    return "standard";
  }

  return "full-day";
};

export const getDriverTripBookingBadgeLabel = (value?: string | null) => {
  const normalizedValue = normalizeBookingText(value);

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.includes("airport")) {
    return "AIRPORT";
  }

  if (
    normalizedValue.includes("standard") ||
    normalizedValue.includes("12")
  ) {
    return "STANDARD";
  }

  if (
    normalizedValue.includes("full day") ||
    normalizedValue.includes("24")
  ) {
    return "FULL DAY RENTAL";
  }

  const durationHours = getBookingDurationHours(normalizedValue);

  if (durationHours !== undefined) {
    return formatBookingDurationBadgeLabel(durationHours);
  }

  return compact(value);
};

export const formatApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getDriverTripStatus = (trip: DriverTrip) =>
  trip.driverTripStatus ?? trip.tripStatus ?? trip.status ?? undefined;

export const getDriverTripStatusLabel = (status: DriverTripStatus) =>
  STATUS_LABELS[status];

export const isDriverTripUpcoming = (trip: DriverTrip) => {
  const status = getDriverTripStatus(trip);
  const startDate = parseDate(trip.startDateTime);

  if (!startDate || startDate.getTime() <= Date.now()) {
    return false;
  }

  return !status || status === "NOT_STARTED";
};

export const isDriverTripActive = (trip: DriverTrip) => {
  const status = getDriverTripStatus(trip);

  if (isDriverTripUpcoming(trip)) {
    return false;
  }

  return !status || ACTIVE_DRIVER_TRIP_STATUSES.includes(status);
};

export const getDriverTripSectionTitle = (trip: DriverTrip) => {
  const startDate = parseDate(trip.startDateTime);

  if (!startDate) {
    return "Other Trips";
  }

  return dateFormatter.format(startDate);
};

export const toDriverTripCardModel = (
  trip: DriverTrip,
  fallbackStatus?: DriverTripStatus,
): DriverTripCardModel => {
  const status = getDriverTripStatus(trip) ?? fallbackStatus;
  const bookingTypeName = getDriverTripBookingBadgeLabel(trip.bookingTypeName);
  const driverOwnerType = compact(trip.driverOwnerType);
  const vehicleName = compact(trip.vehicleName);
  const vehicleIdentifier = compact(trip.vehicleIdentifier);
  const startDate = parseDate(trip.startDateTime);
  const endDate = parseDate(trip.endDateTime);
  const durationLabel = getDurationLabel(trip.tripDuration);
  const timeRange = [
    startDate && endDate
      ? `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`
      : undefined,
    durationLabel ? `(${durationLabel})` : undefined,
  ].filter(Boolean).join(" ");
  const badges = [
    status ? { label: getDriverTripStatusLabel(status) } : undefined,
    bookingTypeName ? { label: bookingTypeName } : undefined,
    driverOwnerType ? { label: driverOwnerType } : undefined,
  ].filter((badge): badge is BadgeProps => Boolean(badge));

  return {
    badges,
    clientName: getFallbackValue(compact(trip.customerName), "Customer"),
    id: trip.id,
    location: getFallbackValue(
      compact(trip.pickupLocation) ?? compact(trip.city),
      "Pickup location unavailable",
    ),
    timeRange: getFallbackValue(timeRange, "Schedule unavailable"),
    tripId: getFallbackValue(compact(trip.tripCustomId), trip.id),
    vehicle: getFallbackValue(
      [vehicleName, vehicleIdentifier].filter(Boolean).join(" • "),
      "Vehicle unavailable",
    ),
  };
};

export const groupDriverTripsForCards = (
  trips: DriverTrip[],
  fallbackStatus?: DriverTripStatus,
): DriverTripSection[] => {
  const groupedTrips = new Map<string, DriverTripCardModel[]>();

  trips.forEach((trip) => {
    const sectionTitle = getDriverTripSectionTitle(trip);
    const sectionTrips = groupedTrips.get(sectionTitle) ?? [];

    sectionTrips.push(toDriverTripCardModel(trip, fallbackStatus));
    groupedTrips.set(sectionTitle, sectionTrips);
  });

  return Array.from(groupedTrips.entries()).map(([title, data]) => ({
    data,
    title,
  }));
};
