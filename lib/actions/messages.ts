"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { conversations, messages, notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

async function getOrCreateConversation(customerId: string, providerId: string): Promise<string> {
  const existing = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.customerId, customerId), eq(conversations.providerId, providerId)))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const id = randomBytes(16).toString("hex");
  await db.insert(conversations).values({ id, customerId, providerId });
  return id;
}

export async function startConversationAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (user.role !== "customer") return;
  const providerId = String(formData.get("providerId") || "");
  const providerRows = await db.select({ role: users.role }).from(users).where(eq(users.id, providerId)).limit(1);
  if (!providerRows[0] || providerRows[0].role !== "provider") return;
  await getOrCreateConversation(user.id, providerId);
  revalidatePath("/dashboard/messages");
}

export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { conversationId, body } = parsed.data;

  const convRows = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  const conv = convRows[0];
  if (!conv) return { error: "Conversation not found" };
  if (conv.customerId !== user.id && conv.providerId !== user.id) {
    return { error: "You are not part of this conversation" };
  }

  await db.insert(messages).values({
    id: randomBytes(16).toString("hex"),
    conversationId,
    senderId: user.id,
    body,
  });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));

  const recipientId = conv.customerId === user.id ? conv.providerId : conv.customerId;
  await db.insert(notifications).values({
    id: randomBytes(16).toString("hex"),
    userId: recipientId,
    title: `New message from ${user.name}`,
    body: body.slice(0, 120),
    link: user.role === "customer" ? "/provider/messages" : "/dashboard/messages",
  });

  revalidatePath("/dashboard/messages");
  revalidatePath("/provider/messages");
  return { success: "sent" };
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const user = await requireUser();
  const convRows = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  const conv = convRows[0];
  if (!conv || (conv.customerId !== user.id && conv.providerId !== user.id)) return;
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.conversationId, conversationId), ne(messages.senderId, user.id)));
}
