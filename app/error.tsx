"use client";

import { Button } from "@/components/ui";
import { LANG_COOKIE, normalizeLang, type Lang } from "@/lib/constants";

const labels: Record<Lang, {
  title: string; unauthorized: string; forbidden: string; generic: string; retry: string;
}> = {
  en: {
    title: "Something went wrong",
    unauthorized: "Please log in to continue.",
    forbidden: "You do not have access to this page.",
    generic: "An unexpected error occurred. Try again.",
    retry: "Try again",
  },
  id: {
    title: "Terjadi kesalahan",
    unauthorized: "Silakan masuk untuk melanjutkan.",
    forbidden: "Anda tidak memiliki akses ke halaman ini.",
    generic: "Terjadi kesalahan tak terduga. Coba lagi.",
    retry: "Coba lagi",
  },
};

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  let lang: Lang = "id";
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
    lang = normalizeLang(match ? decodeURIComponent(match[1]) : undefined);
  }
  const t = labels[lang];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-navy">{t.title}</h1>
      <p className="mt-2 max-w-md text-center text-sm text-ink-soft">
        {error.message.includes("UNAUTHORIZED")
          ? t.unauthorized
          : error.message.includes("FORBIDDEN")
            ? t.forbidden
            : t.generic}
      </p>
      <Button className="mt-6" onClick={reset}>{t.retry}</Button>
    </div>
  );
}
