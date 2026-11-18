import { count, eq, sql } from "drizzle-orm";
import { Users, Building2, Briefcase, CalendarDays, LifeBuoy } from "lucide-react";
import { db } from "@/db";
import { users, providerProfiles, services, bookings, complaints } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, ButtonLink } from "@/components/ui";

export default async function AdminDashboard() {
  await requireRole("admin");

  const [[userCount], [providerCount], [pendingProviders], [serviceCount], [bookingCount], [openComplaints]] = await Promise.all([
    db.select({ n: count(users.id) }).from(users).where(eq(users.role, "customer")),
    db.select({ n: count(providerProfiles.id) }).from(providerProfiles),
    db.select({ n: count(providerProfiles.id) }).from(providerProfiles).where(eq(providerProfiles.status, "pending")),
    db.select({ n: count(services.id) }).from(services),
    db.select({ n: count(bookings.id) }).from(bookings),
    db.select({ n: count(complaints.id) }).from(complaints).where(eq(complaints.status, "open")),
  ]);

  const stats = [
    { label: "Customers", value: userCount.n, icon: Users, href: "/admin/users" },
    { label: "Providers", value: providerCount.n, icon: Building2, href: "/admin/providers" },
    { label: "Services", value: serviceCount.n, icon: Briefcase, href: "/admin/services" },
    { label: "Bookings", value: bookingCount.n, icon: CalendarDays, href: "/admin/bookings" },
    { label: "Open complaints", value: openComplaints.n, icon: LifeBuoy, href: "/admin/complaints" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Monitor and manage the FIXORA platform.</p>
      </div>

      {pendingProviders.n > 0 && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-ink">
            <strong>{pendingProviders.n}</strong> provider application{pendingProviders.n === 1 ? "" : "s"} waiting for review
          </p>
          <ButtonLink href="/admin/providers" size="sm">Review now</ButtonLink>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <ButtonLink key={s.label} href={s.href} className="flex-col items-start gap-2 !justify-start border border-line bg-surface p-5 text-left shadow-card hover:border-blue/40">
            <s.icon className="h-5 w-5 text-blue" strokeWidth={1.8} />
            <span className="text-2xl font-bold text-navy">{s.value}</span>
            <span className="text-xs text-ink-soft">{s.label}</span>
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}
