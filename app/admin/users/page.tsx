import { desc, eq, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { users, bookings } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge } from "@/components/ui";
import { DeleteUserButton } from "@/components/admin-actions";
import { formatDate } from "@/lib/constants";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      createdAt: users.createdAt,
      bookingCount: sql<number>`(select count(*) from ${bookings} where ${bookings.customerId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Users</h1>
        <p className="mt-1 text-sm text-ink-soft">All registered accounts on the platform.</p>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Bookings</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  <p className="font-medium text-ink">{u.name}</p>
                  <p className="text-xs text-ink-soft">{u.email}</p>
                </td>
                <td className="p-4">
                  <StatusBadge status={u.role === "admin" ? "approved" : u.role === "provider" ? "accepted" : "pending"} />
                  <span className="ml-1 text-xs capitalize text-ink-soft">{u.role}</span>
                </td>
                <td className="p-4 text-ink">{u.bookingCount}</td>
                <td className="p-4 text-ink-soft">{formatDate(u.createdAt)}</td>
                <td className="p-4">
                  {u.role !== "admin" && <DeleteUserButton userId={u.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
