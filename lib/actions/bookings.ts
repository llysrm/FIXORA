"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { bookings, services, notifications, conversations, reviews } from "@/db/schema";
import { requireUser, requireRole } from "@/lib/auth";
import { bookingSchema, reviewSchema } from "@/lib/validations";
import { STATUS_LABEL } from "@/lib/constants";
import type { ActionState } from "./auth";

async function notify(userId: string, title: string, body: string, link: string) {
  await db.insert(notifications).values({
    id: randomBytes(16).toString("hex"),
    userId, title, body, link,
  });
}

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== "customer") {
    return { error: "Only customers can book services" };
  }
  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    scheduledDate: formData.get("scheduledDate"),
    timeSlot: formData.get("timeSlot"),
    address: formData.get("address"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const svcRows = await db.select().from(services).where(eq(services.id, data.serviceId)).limit(1);
  const service = svcRows[0];
  if (!service || !service.isActive) return { error: "Service not available" };
  if (new Date(data.scheduledDate + "T23:59:59") < new Date()) {
    return { error: "Pick a future date" };
  }

  const id = randomBytes(16).toString("hex");
  try {
    await db.insert(bookings).values({
      id,
      customerId: user.id,
      providerId: service.providerId,
      serviceId: service.id,
      scheduledDate: data.scheduledDate,
      timeSlot: data.timeSlot,
      address: data.address,
      notes: data.notes || null,
      totalPrice: service.price,
      status: "pending",
    });
  } catch {
    return { error: "That slot is already booked for this provider. Pick another date or time." };
  }

  await notify(
    service.providerId,
    "New booking request",
    `${user.name} booked "${service.title}" for ${data.scheduledDate} (${data.timeSlot}).`,
    "/provider/bookings",
  );
  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
  return { success: "Booking created. Track its status in My Bookings." };
}

async function transitionBooking(
  bookingId: string,
  actorId: string,
  actorRole: "customer" | "provider",
  nextStatus: "accepted" | "rejected" | "in_progress" | "completed" | "cancelled",
): Promise<ActionState> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = rows[0];
  if (!booking) return { error: "Booking not found" };
  const isOwner = actorRole === "customer" ? booking.customerId === actorId : booking.providerId === actorId;
  if (!isOwner) return { error: "You are not part of this booking" };

  const allowed: Record<string, Record<string, string[]>> = {
    customer: {
      pending: ["cancelled"],
      accepted: ["cancelled"],
      rejected: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    },
    provider: {
      pending: ["accepted", "rejected", "cancelled"],
      accepted: ["in_progress", "cancelled"],
      rejected: [],
      in_progress: ["completed"],
      completed: [],
      cancelled: [],
    },
  };
  if (!allowed[actorRole][booking.status].includes(nextStatus)) {
    return { error: `Cannot move booking from ${STATUS_LABEL[booking.status]} to ${STATUS_LABEL[nextStatus]}` };
  }

  await db.update(bookings).set({ status: nextStatus, updatedAt: new Date() }).where(eq(bookings.id, bookingId));

  const svcRows = await db.select({ title: services.title }).from(services).where(eq(services.id, booking.serviceId)).limit(1);
  const svcTitle = svcRows[0]?.title || "service";
  const notifyUserId = actorRole === "customer" ? booking.providerId : booking.customerId;
  await notify(
    notifyUserId,
    `Booking ${STATUS_LABEL[nextStatus]}`,
    `Booking for "${svcTitle}" on ${booking.scheduledDate} (${booking.timeSlot}) is now ${STATUS_LABEL[nextStatus]}.`,
    actorRole === "customer" ? "/provider/bookings" : `/dashboard/bookings/${booking.id}`,
  );
  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  revalidatePath("/provider/bookings");
  revalidatePath("/admin/bookings");
  return { success: `Booking marked as ${STATUS_LABEL[nextStatus]}` };
}

export async function acceptBookingAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  return transitionBooking(String(formData.get("bookingId")), user.id, "provider", "accepted");
}

export async function rejectBookingAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  return transitionBooking(String(formData.get("bookingId")), user.id, "provider", "rejected");
}

export async function startBookingAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  return transitionBooking(String(formData.get("bookingId")), user.id, "provider", "in_progress");
}

export async function completeBookingAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  return transitionBooking(String(formData.get("bookingId")), user.id, "provider", "completed");
}

export async function cancelBookingAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const role = user.role === "provider" ? "provider" : "customer";
  return transitionBooking(String(formData.get("bookingId")), user.id, role, "cancelled");
}

export async function submitReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { bookingId, rating, comment } = parsed.data;

  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = rows[0];
  if (!booking) return { error: "Booking not found" };
  if (booking.customerId !== user.id) return { error: "You can only review your own bookings" };
  if (booking.status !== "completed") return { error: "You can review after the booking is completed" };

  const existing = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
  if (existing.length > 0) return { error: "You already reviewed this booking" };

  await db.insert(reviews).values({
    id: randomBytes(16).toString("hex"),
    bookingId,
    customerId: user.id,
    providerId: booking.providerId,
    rating,
    comment: comment || null,
  });
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  revalidatePath(`/providers/${booking.providerId}`);
  return { success: "Review submitted. Thank you!" };
}
