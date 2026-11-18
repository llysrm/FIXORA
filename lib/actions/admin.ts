"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { users, providerProfiles, services, complaints, notifications, serviceCategories } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "./auth";
import { slugify } from "@/lib/utils";

export async function reviewProviderAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const profileId = String(formData.get("profileId") || "");
  const decision = String(formData.get("decision") || "");
  if (!["approved", "rejected"].includes(decision)) return;
  const reason = String(formData.get("reason") || "");
  const rows = await db.select().from(providerProfiles).where(eq(providerProfiles.id, profileId)).limit(1);
  const profile = rows[0];
  if (!profile) return;
  await db.update(providerProfiles).set({
    status: decision as "approved" | "rejected",
    rejectionReason: decision === "rejected" ? reason || "Application did not meet our quality standards" : null,
    updatedAt: new Date(),
  }).where(eq(providerProfiles.id, profileId));
  await db.insert(notifications).values({
    id: randomBytes(16).toString("hex"),
    userId: profile.userId,
    title: decision === "approved" ? "Provider application approved" : "Provider application rejected",
    body:
      decision === "approved"
        ? "Your provider account is now live. Start listing your services."
        : `Your application was rejected. ${reason || "Contact support for details."}`,
    link: "/provider/dashboard",
  });
  revalidatePath("/admin/providers");
  revalidatePath("/providers");
}

export async function toggleServiceAdminAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const serviceId = String(formData.get("serviceId") || "");
  const rows = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  if (!rows[0]) return;
  await db.update(services).set({ isActive: !rows[0].isActive, updatedAt: new Date() }).where(eq(services.id, serviceId));
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function resolveComplaintAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const complaintId = String(formData.get("complaintId") || "");
  const status = String(formData.get("status") || "");
  const reply = String(formData.get("reply") || "");
  if (!["open", "resolved", "dismissed"].includes(status)) return;
  await db.update(complaints).set({ status: status as "open" | "resolved" | "dismissed", adminReply: reply || null, updatedAt: new Date() }).where(eq(complaints.id, complaintId));
  revalidatePath("/admin/complaints");
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const iconName = String(formData.get("iconName") || "wrench").trim();
  if (name.length < 3) return { error: "Category name must be at least 3 characters" };
  const slug = slugify(name);
  const existing = await db.select({ id: serviceCategories.id }).from(serviceCategories).where(eq(serviceCategories.slug, slug)).limit(1);
  if (existing[0]) return { error: "A category with this name already exists" };
  await db.insert(serviceCategories).values({
    id: randomBytes(16).toString("hex"),
    name, slug,
    description: description || null,
    iconName,
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "Category created" };
}

export async function deleteUserAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const userId = String(formData.get("userId") || "");
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!rows[0] || rows[0].role === "admin") return;
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  revalidatePath("/admin/providers");
}
