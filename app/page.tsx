import Link from "next/link";
import { desc, eq, sql, count, avg } from "drizzle-orm";
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  MessageCircle,
  Star,
  BadgeCheck,
  Search,
} from "lucide-react";
import { db } from "@/db";
import { serviceCategories, services, providerProfiles, users, reviews } from "@/db/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ButtonLink, Card } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { ProviderCard } from "@/components/provider-card";

async function getCategories() {
  return db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      iconName: serviceCategories.iconName,
      description: serviceCategories.description,
      serviceCount: count(services.id),
    })
    .from(serviceCategories)
    .leftJoin(services, eq(services.categoryId, serviceCategories.id))
    .groupBy(serviceCategories.id)
    .orderBy(desc(count(services.id)));
}

async function getFeaturedProviders() {
  return db
    .select({
      userId: providerProfiles.userId,
      businessName: providerProfiles.businessName,
      name: users.name,
      city: providerProfiles.city,
      bio: providerProfiles.bio,
      photoUrl: providerProfiles.photoUrl,
      serviceCount: sql<number>`(select count(*) from ${services} where ${services.providerId} = ${providerProfiles.userId} and ${services.isActive} = 1)`,
      rating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    })
    .from(providerProfiles)
    .innerJoin(users, eq(providerProfiles.userId, users.id))
    .leftJoin(reviews, eq(reviews.providerId, providerProfiles.userId))
    .where(eq(providerProfiles.status, "approved"))
    .groupBy(providerProfiles.userId, users.name)
    .orderBy(desc(count(reviews.id)))
    .limit(3);
}

async function getTestimonials() {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      customerName: users.name,
      providerName: sql<string>`(select business_name from provider_profiles where user_id = ${reviews.providerId})`,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.customerId, users.id))
    .where(sql`${reviews.comment} is not null`)
    .orderBy(desc(reviews.createdAt))
    .limit(3);
}

const whyFixora = [
  {
    icon: ShieldCheck,
    title: "Vetted professionals",
    text: "Every provider is reviewed and approved by our team before they appear on the platform.",
  },
  {
    icon: CalendarCheck,
    title: "Transparent scheduling",
    text: "Pick a date and time slot that works for you. See the price before you book, no surprises.",
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    text: "Message your provider before and during the appointment, all inside the platform.",
  },
];

export default async function HomePage() {
  const [categories, providers, testimonials] = await Promise.all([
    getCategories(),
    getFeaturedProviders(),
    getTestimonials(),
  ]);
  const topCategories = categories.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Home Repairs Made Simple.
              </h1>
              <p className="mt-5 text-lg text-ink-soft sm:text-xl">
                Find trusted professionals for your home maintenance and repair needs, all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/services" size="lg">
                  Find a Service
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/register?role=provider" variant="outline" size="lg">
                  Become a Provider
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">Popular service categories</h2>
              <p className="mt-2 text-ink-soft">Start with what your home needs most.</p>
            </div>
            <Link href="/services" className="hidden items-center gap-1 text-sm font-medium text-blue hover:text-blue-dark sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="group rounded-xl border border-line bg-surface p-5 shadow-card transition-all hover:border-blue/40 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  <CategoryIcon name={cat.iconName} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink group-hover:text-navy">{cat.name}</p>
                <p className="text-xs text-ink-soft">{cat.serviceCount} services</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-navy">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">How FIXORA works</h2>
            <p className="mt-2 text-white/70">From problem to fixed, in three steps.</p>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Search & compare",
                  text: "Browse by category, compare prices, and read reviews from real customers.",
                },
                {
                  step: "02",
                  title: "Book a time slot",
                  text: "Pick a date and time that works. The provider confirms your booking.",
                },
                {
                  step: "03",
                  title: "Job done, rate it",
                  text: "Track the job from accepted to completed, then leave a review.",
                },
              ].map((item, i) => (
                <div key={item.step} className={i > 0 ? "md:border-l md:border-white/10 md:pl-6" : ""}>
                  <span className="font-mono text-sm text-accent">{item.step}</span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured providers */}
        {providers.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy sm:text-3xl">Featured providers</h2>
                <p className="mt-2 text-ink-soft">Approved professionals with proven track records.</p>
              </div>
              <Link href="/services" className="hidden items-center gap-1 text-sm font-medium text-blue hover:text-blue-dark sm:flex">
                Browse services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((p) => (
                <ProviderCard
                  key={p.userId}
                  provider={{
                    ...p,
                    rating: p.rating ? Number(p.rating) : null,
                    serviceCount: Number(p.serviceCount),
                    reviewCount: Number(p.reviewCount),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Why FIXORA */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">Why choose FIXORA</h2>
            <p className="mt-2 text-ink-soft">One platform for everything your home needs.</p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {whyFixora.map((item) => (
                <div key={item.title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <item.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">What customers say</h2>
            <p className="mt-2 text-ink-soft">Real reviews from completed bookings.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} className="flex h-full flex-col p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">{t.comment}</p>
                  <p className="mt-4 text-sm font-medium text-ink">{t.customerName}</p>
                  <p className="text-xs text-ink-soft">reviewed {t.providerName}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Card className="bg-navy p-8 sm:p-12">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">Your home deserves a fix, not a hassle.</h2>
                  <p className="mt-2 text-white/70">Book a trusted professional today.</p>
                </div>
                <ButtonLink href="/services" variant="secondary" size="lg" className="shrink-0">
                  Find a Service
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
