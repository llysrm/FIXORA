import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export function HeroSearch() {
  return (
    <div className="w-full lg:max-w-md">
      <form action="/services" className="rounded-xl border border-line bg-surface p-2 shadow-card">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              placeholder="Search services, e.g. AC repair..."
              aria-label="Search services"
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-blue focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark"
          >
            Search
          </button>
        </div>
      </form>
      <p className="mt-3 text-xs text-ink-soft">
        Popular:{" "}
        <Link href="/services?q=AC" className="font-medium text-blue hover:text-blue-dark">AC</Link>
        {" · "}
        <Link href="/services?q=plumbing" className="font-medium text-blue hover:text-blue-dark">plumbing</Link>
        {" · "}
        <Link href="/services?q=cleaning" className="font-medium text-blue hover:text-blue-dark">cleaning</Link>
      </p>
      <ButtonLink href="/services" variant="outline" className="mt-6 hidden lg:inline-flex">
        Browse all services
        <ArrowRight className="h-4 w-4" />
      </ButtonLink>
    </div>
  );
}
