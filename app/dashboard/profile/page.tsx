import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await requireRole("customer");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Profile settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Update your personal information.</p>
      </div>
      <Card className="p-6">
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl,
          }}
        />
      </Card>
    </div>
  );
}
