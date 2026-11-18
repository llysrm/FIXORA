import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { complaints, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, EmptyState } from "@/components/ui";
import { ComplaintResolveForm } from "@/components/admin-actions";
import { formatDate } from "@/lib/constants";

export default async function AdminComplaintsPage() {
  await requireRole("admin");
  const rows = await db
    .select({
      id: complaints.id,
      subject: complaints.subject,
      message: complaints.message,
      status: complaints.status,
      adminReply: complaints.adminReply,
      createdAt: complaints.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.userId, users.id))
    .orderBy(desc(complaints.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Complaints</h1>
        <p className="mt-1 text-sm text-ink-soft">Handle reports and contact messages.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No complaints" description="When customers report issues, they appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{c.subject}</p>
                  <p className="text-sm text-ink-soft">{c.userName} · {c.userEmail} · {formatDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-3 text-sm text-ink">{c.message}</p>
              {c.adminReply && (
                <p className="mt-2 rounded-lg bg-background p-3 text-sm text-ink-soft">
                  <strong className="text-ink">Admin reply:</strong> {c.adminReply}
                </p>
              )}
              <div className="mt-4">
                <ComplaintResolveForm complaintId={c.id} status={c.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
