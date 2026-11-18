"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversationAction } from "@/lib/actions/messages";
import { MessageCircle } from "lucide-react";

export function StartChatButton({ providerId }: { providerId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("providerId", providerId);
          await startConversationAction(fd);
          router.push("/dashboard/messages");
        })
      }
      className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-navy hover:text-navy disabled:opacity-50"
    >
      <MessageCircle className="h-4 w-4" />
      {pending ? "Opening..." : "Message"}
    </button>
  );
}
