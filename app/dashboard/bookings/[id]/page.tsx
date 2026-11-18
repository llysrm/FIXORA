import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services, providerProfiles, users, reviews } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, Alert, ButtonLink } from "@/components/ui";
import { CancelBookingButton } from "@/components/booking-actions";
import { ReviewForm } from "@/components/review-form";
import { formatPrice, formatDate, STATUS_LABEL } from "@/lib/constants";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("customer");

  const rows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      scheduledDate: bookings.scheduledDate,
      timeSlot: bookings.timeSlot,
      address: bookings.address,
      notes: bookings.notes,
      totalPrice: bookings.totalPrice,
      createdAt: bookings.createdAt,
      serviceTitle: services.title,
      serviceDescription: services.description,
      providerId: bookings.providerId,
      providerName: providerProfiles.businessName,
      providerCity: providerProfiles.city,
      providerUserId: users.id,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.userId))
    .innerJoin(users, eq(bookings.providerId, users.id))
    .where(and(eq(bookings.id, id), eq(bookings.customerId, user.id)))
    .limit(1);
  const booking = rows[0];
  if (!booking) notFound();

  const [review] = await db.select().from(reviews).where(eq(reviews.bookingId, booking.id)).limit(1);

  const canCancel = ["pending", "accepted"].includes(booking.status);
  const canReview = booking.status === "completed" && !review;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/bookings" className="text-sm text-ink-soft hover:text-navy">Back to bookings</Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">{booking.serviceTitle}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              with{" "}
              <Link href={`/providers/${booking.providerUserId}`} className="font-medium text-blue hover:text-blue-dark">
                {booking.providerName}
              </Link>
              {booking.providerCity ? ` · ${booking.providerCity}` : ""}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Scheduled</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{formatDate(booking.scheduledDate)} · {booking.timeSlot}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Total price</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{formatPrice(booking.totalPrice)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Service address</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{booking.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Booked on</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{formatDate(booking.createdAt)}</dd>
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Your notes</dt>
              <dd className="mt-1 text-sm text-ink">{booking.notes}</dd>
            </div>
          )}
        </dl>

        {canCancel && (
          <div className="mt-6 flex gap-3 border-t border-line pt-4">
            <CancelBookingButton bookingId={booking.id} />
            <ButtonLink href={`/dashboard/messages`} variant="outline" size="sm">Message provider</ButtonLink>
          </div>
        )}
        {booking.status === "completed" && (
          <div className="mt-6 border-t border-line pt-4">
            <ButtonLink href={`/providers/${booking.providerUserId}`} variant="outline" size="sm">Book again</ButtonLink>
          </div>
        )}
      </Card>

      {canReview && (
        <Card className="p-6">
          <h2 className="font-semibold text-ink">Rate this service</h2>
          <p className="mt-1 text-sm text-ink-soft">Your review helps other customers pick trusted providers.</p>
          <div className="mt-4">
            <ReviewForm bookingId={booking.id} />
          </div>
        </Card>
      )}

      {review && (
        <Card className="p-6">
          <h2 className="font-semibold text-ink">Your review</h2>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: review.rating }).map((_, i) => (
              <span key={i} className="text-warning">★</span>
            ))}
          </div>
          {review.comment && <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>}
        </Card>
      )}
    </div>
  );
}
