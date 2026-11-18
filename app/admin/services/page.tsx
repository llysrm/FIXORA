import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { services, serviceCategories, providerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge } from "@/components/ui";
import { formatPrice } from "@/lib/constants";
import { CategoryForm, AdminServiceToggle } from "@/components/admin-actions";

export default async function AdminServicesPage() {
  await requireRole("admin");

  const categories = await db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      iconName: serviceCategories.iconName,
      serviceCount: sql<number>`(select count(*) from ${services} where ${services.categoryId} = ${serviceCategories.id})`,
    })
    .from(serviceCategories)
    .orderBy(serviceCategories.name);

  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      price: services.price,
      priceUnit: services.priceUnit,
      isActive: services.isActive,
      categoryName: serviceCategories.name,
      providerName: providerProfiles.businessName,
    })
    .from(services)
    .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.userId))
    .orderBy(desc(services.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Services</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage categories and monitor listings.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-ink">Categories ({categories.length})</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="rounded-lg border border-line px-4 py-3">
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="text-xs text-ink-soft">/{c.slug} · {c.serviceCount} services</p>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-sm font-semibold text-ink">Add category</h3>
          <div className="mt-3 max-w-xl">
            <CategoryForm />
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-ink">All service listings ({rows.length})</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Provider</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="p-4">
                    <p className="font-medium text-ink">{s.title}</p>
                    <p className="text-xs text-ink-soft">{s.categoryName}</p>
                  </td>
                  <td className="p-4 text-ink">{s.providerName}</td>
                  <td className="p-4 text-ink">{formatPrice(s.price)} / {s.priceUnit}</td>
                  <td className="p-4"><StatusBadge status={s.isActive ? "active" : "dismissed"} /></td>
                  <td className="p-4"><AdminServiceToggle serviceId={s.id} isActive={s.isActive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
