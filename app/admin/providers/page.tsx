import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { providerProfiles, users, services } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge } from "@/components/ui";
import { ProviderReviewActions } from "@/components/admin-actions";
import { formatDate } from "@/lib/constants";

export default async function AdminProvidersPage() {
  await requireRole("admin");
  const rows = await db
    .select({
      id: providerProfiles.id,
      userId: providerProfiles.userId,
      businessName: providerProfiles.businessName,
      name: users.name,
      email: users.email,
      city: providerProfiles.city,
      bio: providerProfiles.bio,
      status: providerProfiles.status,
      createdAt: providerProfiles.createdAt,
      serviceCount: sql<number>`(select count(*) from ${services} where ${services.providerId} = ${providerProfiles.userId})`,
    })
    .from(providerProfiles)
    .innerJoin(users, eq(providerProfiles.userId, users.id))
    .orderBy(desc(providerProfiles.createdAt));

  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Providers</h1>
        <p className="mt-1 text-sm text-ink-soft">Review applications and manage provider accounts.</p>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-ink">Pending applications ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{p.businessName}</p>
                    <p className="text-sm text-ink-soft">{p.name} · {p.email}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {p.city || "No city"} · applied {formatDate(p.createdAt)} · {p.serviceCount} service(s)
                    </p>
                    {p.bio && <p className="mt-2 max-w-xl text-sm text-ink-soft">{p.bio}</p>}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4">
                  <ProviderReviewActions profileId={p.id} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold text-ink">All providers ({others.length})</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="p-4 font-medium">Business</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium">Services</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {others.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-medium text-ink">{p.businessName}</td>
                  <td className="p-4">
                    <p className="text-ink">{p.name}</p>
                    <p className="text-xs text-ink-soft">{p.email}</p>
                  </td>
                  <td className="p-4 text-ink">{p.serviceCount}</td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
