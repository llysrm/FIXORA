"use client";

import { useActionState } from "react";
import { createComplaintAction } from "@/lib/actions/complaints";
import type { ActionState } from "@/lib/actions/auth";
import { Input, Textarea, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";
import { LANG_COOKIE, normalizeLang, type Lang } from "@/lib/constants";

const labels: Record<Lang, {
  subject: string; subjectPlaceholder: string; message: string;
  messagePlaceholder: string; send: string; note: string;
}> = {
  en: {
    subject: "Subject", subjectPlaceholder: "What is this about?",
    message: "Message", messagePlaceholder: "Tell us what happened, or what you need help with.",
    send: "Send message",
    note: "Logged-in users can link a report to a specific booking from their booking details page.",
  },
  id: {
    subject: "Subjek", subjectPlaceholder: "Tentang apa ini?",
    message: "Pesan", messagePlaceholder: "Ceritakan apa yang terjadi, atau apa yang Anda butuhkan.",
    send: "Kirim pesan",
    note: "Pengguna yang sudah masuk bisa menghubungkan laporan ke pesanan tertentu dari halaman detail pesanan.",
  },
};

const initial: ActionState = {};

export function ContactForm() {
  const [state, formAction] = useActionState(createComplaintAction, initial);
  let lang: Lang = "id";
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
    lang = normalizeLang(match ? decodeURIComponent(match[1]) : undefined);
  }
  const t = labels[lang];
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label htmlFor="subject">{t.subject}</Label>
        <Input id="subject" name="subject" required placeholder={t.subjectPlaceholder} />
      </div>
      <div>
        <Label htmlFor="message">{t.message}</Label>
        <Textarea id="message" name="message" rows={5} required placeholder={t.messagePlaceholder} />
      </div>
      <SubmitButton size="lg">{t.send}</SubmitButton>
      <p className="text-xs text-ink-soft">{t.note}</p>
    </form>
  );
}
