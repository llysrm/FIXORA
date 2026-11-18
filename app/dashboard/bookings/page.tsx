import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services, providerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, EmptyState, ButtonLink } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/constants";

export default async function MyBookingsPage() {
  const user = await requireRole("customer");
  const rows = await db
    .select({
      id: bookings.id,
      scheduledDate: bookings.scheduledDate,
      timeSlot: bookings.timeSlot,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      serviceTitle: services.title,
      providerName: providerProfiles.businessName,
      providerId: providerProfiles.userId,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.userId))
    .where(eq(bookings.customerId, user.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My bookings</h1>
          <p className="mt-1 text-sm text-ink-soft">Track and manage your service appointments.</p>
        </div>
        <ButtonLink href="/services" size="sm">Book a service</ButtonLink>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When you book a service, it shows up here with live status."
          action={<ButtonLink href="/services" size="sm">Browse services</ButtonLink>}
        />
      ) : (
        <Card className="divide-y divide-line">
          {rows.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink">
                  <Link href={`/dashboard/bookings/${b.id}`} className="hover:text-blue">{b.serviceTitle}</Link>
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {formatDate(b.scheduledDate)} · {b.timeSlot} · with{" "}
                  <Link href={`/providers/${b.providerId}`} className="hover:text-blue">{b.providerName}</Link>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-navy">{formatPrice(b.totalPrice)}</span>
                <StatusBadge status={b.status} />
                <Link href={`/dashboard/bookings/${b.id}`} className="text-sm font-medium text-blue hover:text-blue-dark">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
