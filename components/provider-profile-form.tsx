"use client";

import { useActionState } from "react";
import { updateProviderProfileAction } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/auth";
import { Input, Textarea, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function ProviderProfileForm({
  user,
  profile,
}: {
  user: { name: string; phone: string | null };
  profile: { businessName: string; bio: string; city: string; address: string; photoUrl: string };
}) {
  const [state, formAction] = useActionState(updateProviderProfileAction, initial);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" name="businessName" defaultValue={profile.businessName} required />
      </div>
      <div>
        <Label htmlFor="name">Your full name</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio} placeholder="Tell customers about your experience and specialties." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={profile.city} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user.phone || ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={profile.address} />
      </div>
      <div>
        <Label htmlFor="photoUrl">Profile photo URL</Label>
        <Input id="photoUrl" name="photoUrl" type="url" defaultValue={profile.photoUrl} placeholder="https://..." />
        <p className="mt-1 text-xs text-ink-soft">
          Paste a link to an image (for example from an image host). Cloud uploads can be wired in later.
        </p>
      </div>
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
