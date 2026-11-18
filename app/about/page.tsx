import type { Metadata } from "next";
import { BadgeCheck, Clock3, HandCoins } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TAGLINE } from "@/lib/constants";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Home maintenance should not be a headache.
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              FIXORA started from a simple frustration: finding a reliable plumber, electrician, or
              cleaner meant asking around, waiting on callbacks, and hoping for the best. We built
              the platform we wished existed, one where quality providers are vetted, prices are
              upfront, and the whole job lives in one place.
            </p>
            <p className="mt-3 text-sm font-medium text-blue">{TAGLINE}</p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Vetted, not verified-on-paper",
                text: "We review every provider application manually: identity, skills, and service quality before approval.",
              },
              {
                icon: HandCoins,
                title: "Upfront pricing",
                text: "Providers publish their rates per visit or per hour. You see the full price before you book.",
              },
              {
                icon: Clock3,
                title: "Bookings that stay on track",
                text: "Real-time status tracking from pending to completed, with in-app messaging for anything in between.",
              },
            ].map((item) => (
              <div key={item.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue/10 text-blue">
                  <item.icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h2 className="mt-4 font-semibold text-ink">{item.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
