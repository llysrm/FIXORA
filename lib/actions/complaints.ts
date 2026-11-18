"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { complaintSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function createComplaintAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const parsed = complaintSchema.safeParse({
    bookingId: bookingId || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(complaints).values({
    id: randomBytes(16).toString("hex"),
    userId: user.id,
    bookingId: parsed.data.bookingId || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });
  revalidatePath("/dashboard/bookings");
  return { success: "Report submitted. Our team will follow up soon." };
}
