import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "./logo";
import { ButtonLink } from "./ui";
import { MobileMenu } from "./mobile-menu";
import { UserRound } from "lucide-react";

export async function Navbar() {
  const user = await getSessionUser();
  const dashboardHref =
    user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/services" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">Services</Link>
            <Link href="/about" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">About</Link>
            <Link href="/contact" className="text-sm font-medium text-ink-soft transition-colors hover:text-navy">Contact</Link>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <ButtonLink href={dashboardHref} variant="outline" size="sm">
                <UserRound className="h-4 w-4" />
                Dashboard
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">Log in</ButtonLink>
              <ButtonLink href="/register" size="sm">Sign up</ButtonLink>
            </>
          )}
        </div>
        <MobileMenu user={user ? { role: user.role } : null} />
      </nav>
    </header>
  );
}
