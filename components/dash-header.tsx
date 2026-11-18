"use client";

import { logoutAction } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { Avatar } from "./ui";
import Link from "next/link";

export function DashHeader({ userName, role }: { userName: string; role: string }) {
  const home = role === "admin" ? "/admin" : role === "provider" ? "/provider/dashboard" : "/dashboard";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:px-6">
      <Link href={home} className="text-sm font-semibold text-navy md:hidden">FIXORA</Link>
      <span className="hidden text-sm text-ink-soft md:block">Manage your FIXORA account</span>
      <div className="flex items-center gap-3">
        <Avatar name={userName} size="sm" />
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-danger">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
