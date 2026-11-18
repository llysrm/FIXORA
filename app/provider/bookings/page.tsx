import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, EmptyState } from "@/components/ui";
import { BookingStatusActions } from "@/components/booking-status-actions";
import { formatPrice, formatDate } from "@/lib/constants";

export default async function ProviderBookingsPage() {
  const user = await requireRole("provider");
  const rows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      scheduledDate: bookings.scheduledDate,
      timeSlot: bookings.timeSlot,
      address: bookings.address,
      notes: bookings.notes,
      totalPrice: bookings.totalPrice,
      serviceTitle: services.title,
      customerName: users.name,
      customerPhone: users.phone,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(users, eq(bookings.customerId, users.id))
    .where(eq(bookings.providerId, user.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Bookings</h1>
        <p className="mt-1 text-sm text-ink-soft">Accept, reject, and progress incoming jobs.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No bookings yet" description="When customers book your services, requests appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{b.serviceTitle}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {b.customerName}
                    {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-ink-soft">When</dt>
                  <dd className="font-medium text-ink">{formatDate(b.scheduledDate)} · {b.timeSlot}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Address</dt>
                  <dd className="font-medium text-ink">{b.address}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Price</dt>
                  <dd className="font-medium text-ink">{formatPrice(b.totalPrice)}</dd>
                </div>
                {b.notes && (
                  <div className="sm:col-span-3">
                    <dt className="text-xs text-ink-soft">Customer notes</dt>
                    <dd className="text-ink">{b.notes}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 border-t border-line pt-4">
                <BookingStatusActions bookingId={b.id} status={b.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
