import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "./logo";
import { ButtonLink } from "./ui";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "./language-switcher";
import { UserRound } from "lucide-react";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";
import type { Lang } from "@/lib/constants";

export async function Navbar() {
  const user = await getSessionUser();
  const lang = await getLang();
  const t = getDict(lang);
  const dashboardHref =
    user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/services" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">{t.nav_services}</Link>
            <Link href="/about" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">{t.nav_about}</Link>
            <Link href="/contact" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">{t.nav_contact}</Link>
          </div>
        </div>
        <div id="nav-actions" className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher current={lang} />
          {user ? (
            <ButtonLink href={dashboardHref} variant="outline" size="sm">
              <UserRound className="h-4 w-4" />
              {t.nav_dashboard}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">{t.nav_login}</ButtonLink>
              <ButtonLink href="/register" size="sm">{t.nav_signup}</ButtonLink>
            </>
          )}
        </div>
        <MobileMenu user={user ? { role: user.role } : null} lang={lang} />
      </nav>
    </header>
  );
}
