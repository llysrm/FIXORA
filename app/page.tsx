import Link from "next/link";
import { desc, eq, sql, count, avg } from "drizzle-orm";
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  MessageCircle,
  Star,
} from "lucide-react";
import { db } from "@/db";
import { serviceCategories, services, providerProfiles, users, reviews } from "@/db/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ButtonLink, Card } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { ProviderCard } from "@/components/provider-card";
import { HeroSearch } from "@/components/hero-search";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";
import { formatServiceCount } from "@/lib/constants";

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

export default async function HomePage() {
  const lang = await getLang();
  const t = getDict(lang);
  const [categories, providers, testimonials] = await Promise.all([
    getCategories(),
    getFeaturedProviders(),
    getTestimonials(),
  ]);
  const topCategories = categories.slice(0, 6);

  const whyFixora = [
    { icon: ShieldCheck, title: t.why_1_title, text: t.why_1_text },
    { icon: CalendarCheck, title: t.why_2_title, text: t.why_2_text },
    { icon: MessageCircle, title: t.why_3_title, text: t.why_3_text },
  ];

  const howSteps = [
    { step: "01", title: t.how_step1_title, text: t.how_step1_text },
    { step: "02", title: t.how_step2_title, text: t.how_step2_text },
    { step: "03", title: t.how_step3_title, text: t.how_step3_text },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
                  {t.hero_title}
                </h1>
                <p className="mt-5 text-lg text-ink-soft sm:text-xl">
                  {t.hero_subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/services" size="lg">
                    {t.hero_cta}
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/register?role=provider" variant="outline" size="lg">
                    {t.hero_cta_provider}
                  </ButtonLink>
                </div>
              </div>
              <HeroSearch />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">{t.categories_title}</h2>
              <p className="mt-2 text-ink-soft">{t.categories_subtitle}</p>
            </div>
            <Link href="/services" className="hidden items-center gap-1 text-sm font-medium text-blue hover:text-blue-dark sm:flex">
              {t.categories_view_all} <ArrowRight className="h-4 w-4" />
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
                <p className="text-xs text-ink-soft">{formatServiceCount(Number(cat.serviceCount), lang)}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-navy">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.how_title}</h2>
            <p className="mt-2 text-white/70">{t.how_subtitle}</p>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {howSteps.map((item, i) => (
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
                <h2 className="text-2xl font-bold text-navy sm:text-3xl">{t.providers_title}</h2>
                <p className="mt-2 text-ink-soft">{t.providers_subtitle}</p>
              </div>
              <Link href="/services" className="hidden items-center gap-1 text-sm font-medium text-blue hover:text-blue-dark sm:flex">
                {t.providers_browse} <ArrowRight className="h-4 w-4" />
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
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">{t.why_title}</h2>
            <p className="mt-2 text-ink-soft">{t.why_subtitle}</p>
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
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">{t.testimonials_title}</h2>
            <p className="mt-2 text-ink-soft">{t.testimonials_subtitle}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((tst) => (
                <Card key={tst.id} className="flex h-full flex-col p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: tst.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">{tst.comment}</p>
                  <p className="mt-4 text-sm font-medium text-ink">{tst.customerName}</p>
                  <p className="text-xs text-ink-soft">{t.testimonials_reviewed} {tst.providerName}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Card bg="bg-navy" className="p-8 sm:p-12">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.cta_title}</h2>
                  <p className="mt-2 text-white/70">{t.cta_subtitle}</p>
                </div>
                <ButtonLink href="/services" variant="secondary" size="lg" className="shrink-0">
                  {t.cta_button}
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
