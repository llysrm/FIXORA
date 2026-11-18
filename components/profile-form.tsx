"use client";

import { useActionState } from "react";
import { updateProfileAction, updateProviderProfileAction } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/auth";
import { Input, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function ProfileForm({
  user,
  provider = false,
}: {
  user: { name: string; email: string; phone: string | null; address: string | null; avatarUrl: string | null };
  provider?: boolean;
}) {
  const [state, formAction] = useActionState(
    provider ? updateProviderProfileAction : updateProfileAction,
    initial,
  );
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled />
        <p className="mt-1 text-xs text-ink-soft">Email cannot be changed.</p>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.phone || ""} placeholder="+1 555 010 2030" />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={user.address || ""} placeholder="Street, city" />
      </div>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}
