export const APP_NAME = "FIXORA";
export const TAGLINE = "Your Home, Our Solution.";

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  open: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
  approved: "Approved",
  active: "Active",
};

export const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "13:00-15:00",
  "15:00-17:00",
] as const;

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price / 100);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
