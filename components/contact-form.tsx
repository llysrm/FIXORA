"use client";

import { useActionState } from "react";
import { createComplaintAction } from "@/lib/actions/complaints";
import type { ActionState } from "@/lib/actions/auth";
import { Input, Textarea, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function ContactForm() {
  const [state, formAction] = useActionState(createComplaintAction, initial);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required placeholder="What is this about?" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required placeholder="Tell us what happened, or what you need help with." />
      </div>
      <SubmitButton size="lg">Send message</SubmitButton>
      <p className="text-xs text-ink-soft">
        Logged-in users can link a report to a specific booking from their booking details page.
      </p>
    </form>
  );
}
