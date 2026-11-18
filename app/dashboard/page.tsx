import Link from "next/link";
import { desc, eq, count, sql, and } from "drizzle-orm";
import { CalendarDays, Wallet, Star, MessageSquare } from "lucide-react";
import { db } from "@/db";
import { bookings, services, reviews, notifications } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, EmptyState, ButtonLink } from "@/components/ui";
import { formatPrice, formatDate, STATUS_LABEL } from "@/lib/constants";

export default async function CustomerDashboard() {
  const user = await requireRole("customer");

  const [stats] = await db
    .select({
      total: count(bookings.id),
      completed: sql<number>`sum(case when ${bookings.status} = 'completed' then 1 else 0 end)`,
      active: sql<number>`sum(case when ${bookings.status} in ('pending','accepted','in_progress') then 1 else 0 end)`,
      spent: sql<number>`sum(case when ${bookings.status} = 'completed' then ${bookings.totalPrice} else 0 end)`,
    })
    .from(bookings)
    .where(eq(bookings.customerId, user.id));

  const [unread] = await db
    .select({ n: count(notifications.id) })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), sql`${notifications.readAt} is null`));

  const recent = await db
    .select({
      id: bookings.id,
      scheduledDate: bookings.scheduledDate,
      timeSlot: bookings.timeSlot,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      serviceTitle: services.title,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.customerId, user.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  const cards = [
    { label: "Total bookings", value: Number(stats?.total || 0), icon: CalendarDays },
    { label: "Active bookings", value: Number(stats?.active || 0), icon: MessageSquare },
    { label: "Completed jobs", value: Number(stats?.completed || 0), icon: Star },
    { label: "Total spent", value: formatPrice(Number(stats?.spent || 0)), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Hi, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-ink-soft">Here is what is happening with your home services.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <c.icon className="h-5 w-5 text-blue" strokeWidth={1.8} />
            <p className="mt-3 text-2xl font-bold text-navy">{c.value}</p>
            <p className="text-xs text-ink-soft">{c.label}</p>
          </Card>
        ))}
      </div>

      {Number(unread?.n) > 0 && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-ink">
            You have <strong>{unread.n} unread notification{unread.n === 1 ? "" : "s"}</strong>
          </p>
          <ButtonLink href="/dashboard/notifications" variant="outline" size="sm">View</ButtonLink>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Recent bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-blue hover:text-blue-dark">View all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Browse the catalog and book your first home service."
            action={<ButtonLink href="/services" size="sm">Find a Service</ButtonLink>}
          />
        ) : (
          <Card className="divide-y divide-line">
            {recent.map((b) => (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="flex items-center justify-between p-4 hover:bg-background">
                <div>
                  <p className="text-sm font-medium text-ink">{b.serviceTitle}</p>
                  <p className="text-xs text-ink-soft">{formatDate(b.scheduledDate)} · {b.timeSlot}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-navy sm:block">{formatPrice(b.totalPrice)}</span>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
