import { desc, eq, or, sql, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, users, providerProfiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { MessagesView, type ConversationItem, type MessageItem } from "@/components/messages-view";
import { formatDateTime } from "@/lib/constants";

export default async function CustomerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireRole("customer");
  const { c } = await searchParams;

  const convRows = await db
    .select({
      id: conversations.id,
      otherName: providerProfiles.businessName,
      updatedAt: conversations.updatedAt,
      lastMessage: sql<string | null>`(select body from messages where conversation_id = ${conversations.id} order by created_at desc limit 1)`,
    })
    .from(conversations)
    .innerJoin(providerProfiles, eq(conversations.providerId, providerProfiles.userId))
    .where(eq(conversations.customerId, user.id))
    .orderBy(desc(conversations.updatedAt));

  let msgs: MessageItem[] = [];
  if (c) {
    const owned = convRows.find((x) => x.id === c);
    if (owned) {
      const rows = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          body: messages.body,
          createdAt: messages.createdAt,
          senderName: users.name,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, c))
        .orderBy(messages.createdAt)
        .limit(200);
      msgs = rows.map((m) => ({ ...m, createdAt: formatDateTime(m.createdAt) }));
      await db
        .update(messages)
        .set({ readAt: new Date() })
        .where(and(eq(messages.conversationId, c), ne(messages.senderId, user.id)));
    }
  }

  const items: ConversationItem[] = convRows.map((x) => ({
    id: x.id,
    otherName: x.otherName,
    lastMessage: x.lastMessage,
    updatedAt: formatDateTime(x.updatedAt),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Messages</h1>
      <MessagesView
        role="customer"
        conversations={items}
        activeId={c && convRows.find((x) => x.id === c) ? c : null}
        messages={msgs}
        currentUserId={user.id}
      />
    </div>
  );
}
