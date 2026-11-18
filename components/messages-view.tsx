"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/actions/messages";
import type { ActionState } from "@/lib/actions/auth";
import { Avatar, Input } from "./ui";
import { SubmitButton } from "./submit-button";
import { cn } from "@/lib/utils";

const initial: ActionState = {};

export type ConversationItem = {
  id: string;
  otherName: string;
  lastMessage: string | null;
  updatedAt: string;
};

export type MessageItem = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  senderName: string;
};

export function MessagesView({
  role,
  conversations,
  activeId,
  messages,
  currentUserId,
}: {
  role: "customer" | "provider";
  conversations: ConversationItem[];
  activeId: string | null;
  messages: MessageItem[];
  currentUserId: string;
}) {
  const [state, formAction] = useActionState(sendMessageAction, initial);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const t = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(t);
  }, [router]);

  const basePath = role === "customer" ? "/dashboard/messages" : "/provider/messages";

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3">
      <div className={`md:col-span-1 ${activeId ? "hidden md:block" : ""}`}>
        <div className="h-full overflow-y-auto rounded-xl border border-line bg-surface shadow-card">
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-ink-soft">
              No conversations yet. Message a provider from their profile to start.
            </p>
          ) : (
            conversations.map((c) => (
              <a
                key={c.id}
                href={`${basePath}?c=${c.id}`}
                className={cn(
                  "flex items-center gap-3 border-b border-line p-4 last:border-0 hover:bg-background",
                  activeId === c.id && "bg-blue/5",
                )}
              >
                <Avatar name={c.otherName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.otherName}</p>
                  <p className="truncate text-xs text-ink-soft">{c.lastMessage || "No messages yet"}</p>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      <div className={`flex flex-col md:col-span-2 ${activeId ? "" : "hidden md:flex"}`}>
        {activeId ? (
          <div className="flex h-full flex-col rounded-xl border border-line bg-surface shadow-card">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-soft">Say hello to start the conversation.</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.senderId === currentUserId ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      m.senderId === currentUserId ? "bg-navy text-white" : "bg-background text-ink",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={cn("mt-1 text-[10px]", m.senderId === currentUserId ? "text-white/60" : "text-ink-soft")}>
                      {m.senderName.split(" ")[0]} · {m.createdAt}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form action={formAction} className="flex items-center gap-2 border-t border-line p-3">
              <input type="hidden" name="conversationId" value={activeId} />
              <Input name="body" placeholder="Type a message..." required autoComplete="off" className="flex-1" key={state.success || "form"} />
              <SubmitButton size="sm">Send</SubmitButton>
            </form>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line bg-surface">
            <p className="text-sm text-ink-soft">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
