import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";

export default async function NotFound() {
  const lang = await getLang();
  const t = getDict(lang);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="font-mono text-sm text-blue">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy">{t.notfound_title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{t.notfound_text}</p>
      <ButtonLink href="/" className="mt-6">{t.notfound_back}</ButtonLink>
    </div>
  );
}
