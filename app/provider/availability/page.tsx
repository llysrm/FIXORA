import { eq } from "drizzle-orm";
import { db } from "@/db";
import { providerAvailability } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui";
import { AvailabilityForm } from "@/components/availability-form";
import { DAYS } from "@/lib/constants";

export default async function AvailabilityPage() {
  const user = await requireRole("provider");
  const rows = await db
    .select()
    .from(providerAvailability)
    .where(eq(providerAvailability.providerId, user.id));

  const initial = Array.from({ length: 7 }, (_, day) => {
    const row = rows.find((r) => r.dayOfWeek === day);
    return {
      day,
      isActive: row?.isActive ?? (day >= 1 && day <= 5),
      startTime: row?.startTime ?? "08:00",
      endTime: row?.endTime ?? "17:00",
    };
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Availability</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Set the days and hours you accept bookings. Customers book fixed 2-hour slots.
        </p>
      </div>
      <Card className="p-6">
        <AvailabilityForm initial={initial} />
      </Card>
    </div>
  );
}
