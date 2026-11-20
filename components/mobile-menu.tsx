"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserRound, Globe } from "lucide-react";
import type { Lang } from "@/lib/constants";
import { setLangCookie } from "@/lib/lang-client";

const labels = {
  en: {
    services: "Services",
    about: "About",
    contact: "Contact",
    dashboard: "Dashboard",
    login: "Log in",
    signup: "Sign up",
    menu_open: "Open menu",
    menu_close: "Close menu",
    language: "Language",
  },
  id: {
    services: "Layanan",
    about: "Tentang",
    contact: "Kontak",
    dashboard: "Dashboard",
    login: "Masuk",
    signup: "Daftar",
    menu_open: "Buka menu",
    menu_close: "Tutup menu",
    language: "Bahasa",
  },
};

export function MobileMenu({ user, lang }: { user: { role: string } | null; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const t = labels[lang];
  const dashboardHref =
    user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider/dashboard" : "/dashboard";

  const switchLang = (next: "en" | "id") => {
    if (next === lang) return;
    setLangCookie(next);
    window.location.reload();
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-ink hover:bg-background"
        aria-label={open ? t.menu_close : t.menu_open}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-line bg-surface p-4 shadow-lift">
          <div className="flex flex-col gap-1">
            <Link href="/services" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">{t.services}</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">{t.about}</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">{t.contact}</Link>
            <div className="my-2 border-t border-line" />
            {user ? (
              <Link href={dashboardHref} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-background">
                <UserRound className="h-4 w-4" /> {t.dashboard}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">{t.login}</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg bg-navy px-3 py-2.5 text-sm font-medium text-white hover:bg-navy-dark">{t.signup}</Link>
              </>
            )}
            <div className="my-2 border-t border-line" />
            <div className="flex items-center gap-2 px-3">
              <Globe className="h-4 w-4 text-ink-soft" />
              <span className="text-xs font-medium text-ink-soft">{t.language}</span>
              <div className="ml-auto flex items-center rounded-lg border border-line p-0.5">
                {(["id", "en"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => switchLang(opt)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                      lang === opt ? "bg-navy text-white" : "text-ink-soft"
                    }`}
                    aria-pressed={lang === opt}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
