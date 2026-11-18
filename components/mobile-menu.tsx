"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserRound } from "lucide-react";

export function MobileMenu({ user }: { user: { role: string } | null }) {
  const [open, setOpen] = useState(false);
  const dashboardHref =
    user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider/dashboard" : "/dashboard";

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-ink hover:bg-background"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-line bg-surface p-4 shadow-lift">
          <div className="flex flex-col gap-1">
            <Link href="/services" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">Services</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">About</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">Contact</Link>
            <div className="my-2 border-t border-line" />
            {user ? (
              <Link href={dashboardHref} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-background">
                <UserRound className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background">Log in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg bg-navy px-3 py-2.5 text-sm font-medium text-white hover:bg-navy-dark">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
