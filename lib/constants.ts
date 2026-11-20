export const APP_NAME = "FIXORA";
export const TAGLINE = "Your Home, Our Solution.";

export const LANG_COOKIE = "fixora_lang";
export const DEFAULT_LANG = "id" as const;
export type Lang = "en" | "id";

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABEL: Record<string, Record<Lang, string>> = {
  pending: { en: "Pending", id: "Menunggu" },
  accepted: { en: "Accepted", id: "Diterima" },
  rejected: { en: "Rejected", id: "Ditolak" },
  in_progress: { en: "In Progress", id: "Dikerjakan" },
  completed: { en: "Completed", id: "Selesai" },
  cancelled: { en: "Cancelled", id: "Dibatalkan" },
  open: { en: "Open", id: "Terbuka" },
  resolved: { en: "Resolved", id: "Terselesaikan" },
  dismissed: { en: "Dismissed", id: "Ditutup" },
  approved: { en: "Approved", id: "Disetujui" },
  active: { en: "Active", id: "Aktif" },
};

export const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "13:00-15:00",
  "15:00-17:00",
] as const;

export const DAYS: Record<Lang, readonly string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  id: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
};

export function normalizeLang(value: string | undefined | null): Lang {
  return value === "en" ? "en" : "id";
}

// Prices are stored in cents. Displayed in Rupiah without cents.
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price / 100);
}

export function formatDate(d: Date | string, lang: Lang = "id"): string {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatDateTime(d: Date | string, lang: Lang = "id"): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatReviewCount(count: number, lang: Lang = "id"): string {
  if (lang === "id") return `${count} ulasan`;
  return count === 1 ? "1 review" : `${count} reviews`;
}

export function formatServiceCount(count: number, lang: Lang = "id"): string {
  if (lang === "id") return `${count} layanan`;
  return count === 1 ? "1 service" : `${count} services`;
}
