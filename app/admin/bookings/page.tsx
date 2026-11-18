import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, EmptyState } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/constants";

export default async function AdminBookingsPage() {
  await requireRole("admin");
  const rows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      scheduledDate: bookings.scheduledDate,
      timeSlot: bookings.timeSlot,
      totalPrice: bookings.totalPrice,
      serviceTitle: services.title,
      customerName: users.name,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(users, eq(bookings.customerId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Bookings</h1>
        <p className="mt-1 text-sm text-ink-soft">All bookings across the platform.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No bookings yet" description="Bookings will appear here once customers start ordering." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="p-4 font-medium text-ink">{b.serviceTitle}</td>
                  <td className="p-4 text-ink">{b.customerName}</td>
                  <td className="p-4 text-ink-soft">{formatDate(b.scheduledDate)} · {b.timeSlot}</td>
                  <td className="p-4 text-ink">{formatPrice(b.totalPrice)}</td>
                  <td className="p-4"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
