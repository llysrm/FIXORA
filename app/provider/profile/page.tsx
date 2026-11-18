import { eq } from "drizzle-orm";
import { db } from "@/db";
import { providerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { Card, StatusBadge } from "@/components/ui";
import { ProviderProfileForm } from "@/components/provider-profile-form";

export default async function ProviderProfilePage() {
  const user = await requireRole("provider");
  const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, user.id)).limit(1);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Provider profile</h1>
          <p className="mt-1 text-sm text-ink-soft">This is what customers see on your public profile.</p>
        </div>
        {profile && <StatusBadge status={profile.status} />}
      </div>
      <Card className="p-6">
        <ProviderProfileForm
          user={{ name: user.name, phone: user.phone }}
          profile={{
            businessName: profile?.businessName || "",
            bio: profile?.bio || "",
            city: profile?.city || "",
            address: profile?.address || "",
            photoUrl: profile?.photoUrl || "",
          }}
        />
      </Card>
    </div>
  );
}
