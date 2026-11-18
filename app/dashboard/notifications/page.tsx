import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/constants";

export default async function NotificationsPage() {
  const user = await requireRole("customer");
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Notifications</h1>
        <p className="mt-1 text-sm text-ink-soft">Updates about your bookings and messages.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No notifications" description="You are all caught up." />
      ) : (
        <Card className="divide-y divide-line">
          {rows.map((n) => (
            <Link
              key={n.id}
              href={n.link || "/dashboard"}
              className={`block p-4 hover:bg-background ${!n.readAt ? "bg-blue/5" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-blue" aria-label="unread" />}
              </div>
              {n.body && <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>}
              <p className="mt-1 text-xs text-ink-soft">{formatDateTime(n.createdAt)}</p>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
