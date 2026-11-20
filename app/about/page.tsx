import type { Metadata } from "next";
import { BadgeCheck, Clock3, HandCoins } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TAGLINE } from "@/lib/constants";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const lang = await getLang();
  const t = getDict(lang);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {t.about_title}
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              {t.about_body}
            </p>
            <p className="mt-3 text-sm font-medium text-blue">{TAGLINE}</p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: t.about_card1_title,
                text: t.about_card1_text,
              },
              {
                icon: HandCoins,
                title: t.about_card2_title,
                text: t.about_card2_text,
              },
              {
                icon: Clock3,
                title: t.about_card3_title,
                text: t.about_card3_text,
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
