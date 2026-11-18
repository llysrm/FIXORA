"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { services, providerProfiles, users } from "@/db/schema";
import { requireRole, requireUser } from "@/lib/auth";
import { serviceSchema, providerProfileSchema, profileSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("provider");
  const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, user.id)).limit(1);
  if (!profile[0] || profile[0].status !== "approved") {
    return { error: "Your provider account must be approved before listing services" };
  }
  const parsed = serviceSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    priceUnit: formData.get("priceUnit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  await db.insert(services).values({
    id: randomBytes(16).toString("hex"),
    providerId: user.id,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    price: data.price,
    priceUnit: data.priceUnit,
  });
  revalidatePath("/provider/services");
  revalidatePath("/services");
  return { success: "Service created" };
}

export async function updateServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("provider");
  const serviceId = String(formData.get("serviceId") || "");
  const parsed = serviceSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    priceUnit: formData.get("priceUnit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  const owned = await db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.providerId, user.id)))
    .limit(1);
  if (!owned[0]) return { error: "Service not found" };
  await db.update(services).set({
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    price: data.price,
    priceUnit: data.priceUnit,
    updatedAt: new Date(),
  }).where(eq(services.id, serviceId));
  revalidatePath("/provider/services");
  revalidatePath("/services");
  return { success: "Service updated" };
}

export async function toggleServiceAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  const serviceId = String(formData.get("serviceId") || "");
  const rows = await db.select().from(services).where(and(eq(services.id, serviceId), eq(services.providerId, user.id))).limit(1);
  if (!rows[0]) return;
  await db.update(services).set({ isActive: !rows[0].isActive, updatedAt: new Date() }).where(eq(services.id, serviceId));
  revalidatePath("/provider/services");
  revalidatePath("/services");
}

export async function deleteServiceAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  const serviceId = String(formData.get("serviceId") || "");
  await db.delete(services).where(and(eq(services.id, serviceId), eq(services.providerId, user.id)));
  revalidatePath("/provider/services");
  revalidatePath("/services");
}

export async function updateProviderProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("provider");
  const parsed = providerProfileSchema.safeParse({
    businessName: formData.get("businessName"),
    bio: formData.get("bio") || undefined,
    city: formData.get("city") || undefined,
    address: formData.get("address") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  await db.update(providerProfiles).set({
    businessName: data.businessName,
    bio: data.bio || null,
    city: data.city || null,
    address: data.address || null,
    photoUrl: data.photoUrl || null,
    updatedAt: new Date(),
  }).where(eq(providerProfiles.userId, user.id));
  await db.update(users).set({
    name: String(formData.get("name") || user.name).trim() || user.name,
    phone: String(formData.get("phone") || "").trim() || null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));
  revalidatePath("/provider/profile");
  revalidatePath("/providers");
  return { success: "Profile updated" };
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  await db.update(users).set({
    name: data.name,
    phone: data.phone || null,
    address: data.address || null,
    avatarUrl: data.avatarUrl || null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/profile");
  return { success: "Profile updated" };
}

export async function saveAvailabilityAction(formData: FormData) {
  "use server";
  const user = await requireRole("provider");
  const { providerAvailability } = await import("@/db/schema");
  for (let day = 0; day < 7; day++) {
    const isActive = formData.get(`day-${day}`) === "on";
    const startTime = String(formData.get(`start-${day}`) || "08:00");
    const endTime = String(formData.get(`end-${day}`) || "17:00");
    const existing = await db
      .select({ id: providerAvailability.id })
      .from(providerAvailability)
      .where(and(eq(providerAvailability.providerId, user.id), eq(providerAvailability.dayOfWeek, day)))
      .limit(1);
    if (existing[0]) {
      await db.update(providerAvailability)
        .set({ isActive, startTime, endTime, updatedAt: new Date() })
        .where(eq(providerAvailability.id, existing[0].id));
    } else {
      await db.insert(providerAvailability).values({
        id: randomBytes(16).toString("hex"),
        providerId: user.id,
        dayOfWeek: day,
        startTime,
        endTime,
        isActive,
      });
    }
  }
  revalidatePath("/provider/availability");
}
