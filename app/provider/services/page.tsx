import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services, serviceCategories, providerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge, Button } from "@/components/ui";
import { formatPrice } from "@/lib/constants";
import { ServiceForm } from "@/components/service-form";
import { ServiceRowActions } from "@/components/service-row-actions";

export default async function ProviderServicesPage() {
  const user = await requireRole("provider");
  const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, user.id)).limit(1);
  const categories = await db.select().from(serviceCategories).orderBy(serviceCategories.name);

  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      description: services.description,
      price: services.price,
      priceUnit: services.priceUnit,
      isActive: services.isActive,
      categoryId: services.categoryId,
      categoryName: serviceCategories.name,
    })
    .from(services)
    .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(eq(services.providerId, user.id))
    .orderBy(desc(services.createdAt));

  const approved = profile?.status === "approved";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My services</h1>
        <p className="mt-1 text-sm text-ink-soft">Create and manage the services customers can book.</p>
      </div>

      {approved ? (
        <Card className="p-6">
          <h2 className="font-semibold text-ink">Add a new service</h2>
          <div className="mt-4">
            <ServiceForm categories={categories} />
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-ink-soft">
          Your provider account must be approved by an admin before you can list services.
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-semibold text-ink">Your listings ({rows.length})</h2>
        {rows.length === 0 ? (
          <Card className="p-6 text-sm text-ink-soft">No services yet.</Card>
        ) : (
          <Card className="divide-y divide-line">
            {rows.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{s.title}</p>
                    <StatusBadge status={s.isActive ? "active" : "dismissed"} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {s.categoryName} · {formatPrice(s.price)} / {s.priceUnit}
                  </p>
                </div>
                <ServiceRowActions service={s} categories={categories} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
