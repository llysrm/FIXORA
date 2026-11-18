"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { reviewProviderAction, toggleServiceAdminAction, resolveComplaintAction, deleteUserAction, createCategoryAction } from "@/lib/actions/admin";
import type { ActionState } from "@/lib/actions/auth";
import { Button, Input, Label, Select, Alert } from "./ui";
import { SubmitButton } from "./submit-button";

export function ProviderReviewActions({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function decide(decision: "approved" | "rejected") {
    const reason = decision === "rejected" ? prompt("Reason for rejection (shown to the provider):") || "" : "";
    startTransition(async () => {
      const fd = new FormData();
      fd.set("profileId", profileId);
      fd.set("decision", decision);
      fd.set("reason", reason);
      await reviewProviderAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => decide("approved")}>Approve</Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => decide("rejected")}>Reject</Button>
    </div>
  );
}

export function AdminServiceToggle({ serviceId, isActive }: { serviceId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("serviceId", serviceId);
          await toggleServiceAdminAction(fd);
          router.refresh();
        })
      }
    >
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-danger"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
        startTransition(async () => {
          const fd = new FormData();
          fd.set("userId", userId);
          await deleteUserAction(fd);
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}

export function ComplaintResolveForm({ complaintId, status }: { complaintId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function resolve(next: string) {
    const reply = next !== "open" ? prompt("Reply to the user (optional):") || "" : "";
    startTransition(async () => {
      const fd = new FormData();
      fd.set("complaintId", complaintId);
      fd.set("status", next);
      fd.set("reply", reply);
      await resolveComplaintAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => resolve("resolved")}>Mark resolved</Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => resolve("dismissed")}>Dismiss</Button>
        </>
      )}
      {status !== "open" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => resolve("open")}>Reopen</Button>
      )}
    </div>
  );
}

const catInitial: ActionState = {};

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, catInitial);
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="cat-name">Category name</Label>
        <Input id="cat-name" name="name" required placeholder="e.g. Painting" />
      </div>
      <div>
        <Label htmlFor="cat-desc">Description</Label>
        <Input id="cat-desc" name="description" placeholder="Short description (optional)" />
      </div>
      <div>
        <Label htmlFor="cat-icon">Icon</Label>
        <Select id="cat-icon" name="iconName" defaultValue="wrench">
          <option value="wrench">Wrench</option>
          <option value="air-vent">Air conditioning</option>
          <option value="droplets">Plumbing</option>
          <option value="zap">Electrical</option>
          <option value="sparkles">Cleaning</option>
          <option value="washing-machine">Appliance</option>
          <option value="shirt">Laundry</option>
          <option value="hammer">Handyman</option>
          <option value="paintbrush">Painting</option>
        </Select>
      </div>
      <SubmitButton size="sm">Create category</SubmitButton>
    </form>
  );
}
