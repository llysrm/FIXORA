import { desc, eq, sql, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { MessagesView, type ConversationItem, type MessageItem } from "@/components/messages-view";
import { formatDateTime } from "@/lib/constants";

export default async function ProviderMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireRole("provider");
  const { c } = await searchParams;

  const convRows = await db
    .select({
      id: conversations.id,
      otherName: users.name,
      updatedAt: conversations.updatedAt,
      lastMessage: sql<string | null>`(select body from messages where conversation_id = ${conversations.id} order by created_at desc limit 1)`,
    })
    .from(conversations)
    .innerJoin(users, eq(conversations.customerId, users.id))
    .where(eq(conversations.providerId, user.id))
    .orderBy(desc(conversations.updatedAt));

  let msgs: MessageItem[] = [];
  if (c && convRows.find((x) => x.id === c)) {
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
        role="provider"
        conversations={items}
        activeId={c && convRows.find((x) => x.id === c) ? c : null}
        messages={msgs}
        currentUserId={user.id}
      />
    </div>
  );
}
