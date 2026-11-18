import { desc, eq, count, sql, and } from "drizzle-orm";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Star, Wallet } from "lucide-react";
import { db } from "@/db";
import { bookings, services, reviews, providerProfiles, notifications } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, ButtonLink } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/constants";

export default async function ProviderDashboard() {
  const user = await requireRole("provider");
  const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, user.id)).limit(1);

  const [stats] = await db
    .select({
      total: count(bookings.id),
      pending: sql<number>`sum(case when ${bookings.status} = 'pending' then 1 else 0 end)`,
      completed: sql<number>`sum(case when ${bookings.status} = 'completed' then 1 else 0 end)`,
      earnings: sql<number>`sum(case when ${bookings.status} = 'completed' then ${bookings.totalPrice} else 0 end)`,
    })
    .from(bookings)
    .where(eq(bookings.providerId, user.id));

  const [rating] = await db
    .select({ avgRating: sql<number>`avg(${reviews.rating})`, total: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.providerId, user.id));

  const [svcCount] = await db
    .select({ n: count(services.id) })
    .from(services)
    .where(and(eq(services.providerId, user.id), eq(services.isActive, true)));

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
    .where(eq(bookings.providerId, user.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  const cards = [
    { label: "Pending requests", value: Number(stats?.pending || 0), icon: CalendarDays },
    { label: "Completed jobs", value: Number(stats?.completed || 0), icon: Star },
    { label: "Earnings (completed)", value: formatPrice(Number(stats?.earnings || 0)), icon: Wallet },
    { label: "Active services", value: Number(svcCount?.n || 0), icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{profile?.businessName || user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
            Provider account
            {profile && <StatusBadge status={profile.status} />}
          </p>
        </div>
        <ButtonLink href="/provider/services" size="sm">Manage services</ButtonLink>
      </div>

      {profile?.status === "pending" && (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-ink">Your application is under review</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              You can set up your profile now. Services go public once an admin approves your account.
            </p>
          </div>
        </Card>
      )}
      {profile?.status === "rejected" && (
        <Card className="border-danger/40 bg-danger/5 p-4">
          <p className="text-sm font-medium text-ink">Your application was rejected</p>
          <p className="mt-0.5 text-sm text-ink-soft">{profile.rejectionReason || "Contact support for details."}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <c.icon className="h-5 w-5 text-blue" strokeWidth={1.8} />
            <p className="mt-3 text-2xl font-bold text-navy">{c.value}</p>
            <p className="text-xs text-ink-soft">{c.label}</p>
          </Card>
        ))}
      </div>

      {Number(rating?.total) > 0 && (
        <Card className="flex items-center gap-3 p-4">
          <Star className="h-5 w-5 fill-warning text-warning" />
          <p className="text-sm text-ink">
            <strong>{Number(rating.avgRating).toFixed(1)}</strong> average from {rating?.total} review{rating?.total === 1 ? "" : "s"}
          </p>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Recent bookings</h2>
          <Link href="/provider/bookings" className="text-sm font-medium text-blue hover:text-blue-dark">View all</Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-6 text-sm text-ink-soft">No bookings yet. Once your account is approved and services are listed, requests will appear here.</Card>
        ) : (
          <Card className="divide-y divide-line">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-ink">{b.serviceTitle}</p>
                  <p className="text-xs text-ink-soft">{formatDate(b.scheduledDate)} · {b.timeSlot}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-navy sm:block">{formatPrice(b.totalPrice)}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
