"use client";

import { useActionState } from "react";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/auth";
import { Input, Textarea, Label, Select, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

type Category = { id: string; name: string };

export function ServiceForm({
  categories,
  service,
}: {
  categories: Category[];
  service?: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceUnit: string;
    categoryId: string;
  };
}) {
  const [state, formAction] = useActionState(
    service ? updateServiceAction : createServiceAction,
    initial,
  );
  return (
    <form action={formAction} className="space-y-4">
      {service && <input type="hidden" name="serviceId" value={service.id} />}
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && !service && <Alert kind="success">{state.success}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={service?.categoryId || ""} required>
            <option value="" disabled>Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="title">Service title</Label>
          <Input id="title" name="title" defaultValue={service?.title} required placeholder="e.g. AC deep cleaning" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={service?.description} required placeholder="What is included, how long it takes, what the customer should prepare..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" min="1" step="1" defaultValue={service ? service.price / 100 : undefined} required placeholder="50" />
          <p className="mt-1 text-xs text-ink-soft">Stored as cents. Enter whole dollars.</p>
        </div>
        <div>
          <Label htmlFor="priceUnit">Price unit</Label>
          <Select id="priceUnit" name="priceUnit" defaultValue={service?.priceUnit || "visit"}>
            <option value="visit">Per visit</option>
            <option value="hour">Per hour</option>
          </Select>
        </div>
      </div>
      <SubmitButton>{service ? "Save changes" : "Create service"}</SubmitButton>
    </form>
  );
}
