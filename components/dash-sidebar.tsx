"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Bell,
  UserRound,
  Wrench,
  Clock,
  Users,
  Building2,
  Briefcase,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { logoutAction } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

const navSets = {
  customer: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "My bookings", icon: CalendarDays },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  provider: [
    { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/provider/services", label: "My services", icon: Wrench },
    { href: "/provider/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/provider/availability", label: "Availability", icon: Clock },
    { href: "/provider/messages", label: "Messages", icon: MessageSquare },
    { href: "/provider/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/providers", label: "Providers", icon: Building2 },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/admin/complaints", label: "Complaints", icon: LifeBuoy },
  ],
};

export function DashSidebar({ role, userName }: { role: keyof typeof navSets; userName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface md:flex md:flex-col">
      <div className="p-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navSets[role].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-navy text-white" : "text-ink-soft hover:bg-background hover:text-navy",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <p className="truncate text-sm font-medium text-ink">{userName}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-2 flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-danger"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function DashMobileNav({ role }: { role: keyof typeof navSets }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 md:hidden">
      {navSets[role].map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
              active ? "bg-navy text-white" : "text-ink-soft hover:bg-background",
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
