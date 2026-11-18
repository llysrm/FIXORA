"use client";

import { useActionState } from "react";
import { createBookingAction } from "@/lib/actions/bookings";
import type { ActionState } from "@/lib/actions/auth";
import { TIME_SLOTS } from "@/lib/constants";
import { Input, Textarea, Label, Select, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function BookingForm({ serviceId }: { serviceId: string }) {
  const [state, formAction] = useActionState(createBookingAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="scheduledDate">Date</Label>
        <Input id="scheduledDate" name="scheduledDate" type="date" min={today} required />
      </div>
      <div>
        <Label htmlFor="timeSlot">Time slot</Label>
        <Select id="timeSlot" name="timeSlot" required defaultValue="">
          <option value="" disabled>Select a slot</option>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="address">Service address</Label>
        <Input id="address" name="address" required placeholder="Street, number, city" />
      </div>
      <div>
        <Label htmlFor="notes">Notes for the provider (optional)</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="Describe the problem, gate code, etc." />
      </div>
      <SubmitButton className="w-full" size="lg">Request booking</SubmitButton>
    </form>
  );
}
