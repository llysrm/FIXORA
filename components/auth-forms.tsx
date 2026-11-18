"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type ActionState } from "@/lib/actions/auth";
import { Input, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" />
      </div>
      <SubmitButton className="w-full" size="lg">Log in</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-blue hover:text-blue-dark">Sign up</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ defaultRole = "customer" }: { defaultRole?: string }) {
  const [state, formAction] = useActionState(registerAction, initial);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <fieldset>
        <Label>I want to</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="role" value="customer" defaultChecked={defaultRole !== "provider"} className="peer sr-only" />
            <div className="rounded-lg border border-line px-4 py-3 text-center text-sm font-medium text-ink-soft peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white">
              Book services
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="role" value="provider" defaultChecked={defaultRole === "provider"} className="peer sr-only" />
            <div className="rounded-lg border border-line px-4 py-3 text-center text-sm font-medium text-ink-soft peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white">
              Offer services
            </div>
          </label>
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">Provider accounts are reviewed by our admin before going live.</p>
      </fieldset>
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder="Jane Cooper" />
      </div>
      <div id="provider-fields" className="grid gap-4">
        <div>
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" name="businessName" placeholder="Cooper Home Repair" />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="Portland" />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
      </div>
      <SubmitButton className="w-full" size="lg">Create account</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue hover:text-blue-dark">Log in</Link>
      </p>
    </form>
  );
}
