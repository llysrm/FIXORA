import type { Metadata } from "next";
import { and, avg, count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { serviceCategories, services, providerProfiles, users, reviews } from "@/db/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceCard, type ServiceCardData } from "@/components/service-card";
import { EmptyState, Input, Select, Button } from "@/components/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";
import { formatServiceCount } from "@/lib/constants";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang);

  const categories = await db
    .select({ id: serviceCategories.id, name: serviceCategories.name, slug: serviceCategories.slug })
    .from(serviceCategories)
    .orderBy(serviceCategories.name);

  const conditions = [eq(services.isActive, true), eq(providerProfiles.status, "approved")];
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(like(services.title, term), like(services.description, term))!,
    );
  }
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    if (cat) conditions.push(eq(services.categoryId, cat.id));
  }

  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      description: services.description,
      price: services.price,
      priceUnit: services.priceUnit,
      categoryName: serviceCategories.name,
      providerId: providerProfiles.userId,
      providerName: providerProfiles.businessName,
      providerCity: providerProfiles.city,
      rating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    })
    .from(services)
    .innerJoin(users, eq(services.providerId, users.id))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId))
    .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .leftJoin(reviews, eq(reviews.providerId, services.providerId))
    .where(and(...conditions))
    .groupBy(services.id, serviceCategories.name, providerProfiles.userId)
    .orderBy(sort === "price_asc" ? services.price : desc(services.createdAt))
    .limit(60);

  const items: ServiceCardData[] = rows.map((r) => ({
    ...r,
    rating: r.rating ? Number(r.rating) : null,
    reviewCount: Number(r.reviewCount),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy">{t.services_title}</h1>
        <p className="mt-2 text-ink-soft">{t.services_subtitle}</p>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/services">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input name="q" defaultValue={q || ""} placeholder={t.services_search_placeholder} className="pl-9" aria-label={t.services_search_placeholder} />
          </div>
          <Select name="category" defaultValue={category || ""} aria-label={t.services_filter} className="sm:w-56">
            <option value="">{t.services_all_categories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Select name="sort" defaultValue={sort || ""} aria-label={t.services_filter} className="sm:w-44">
            <option value="">{t.services_sort_newest}</option>
            <option value="price_asc">{t.services_sort_price}</option>
          </Select>
          <Button type="submit" className="sm:w-28">{t.services_filter}</Button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          {formatServiceCount(items.length, lang)} {t.services_found}
          {category ? ` ${t.services_in} ${categories.find((c) => c.slug === category)?.name || category}` : ""}
        </p>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={t.services_none_title}
              description={t.services_none_text}
              action={<Link href="/services" className="text-sm font-medium text-blue hover:text-blue-dark">{t.services_clear}</Link>}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <ServiceCard key={s.id} service={s} lang={lang} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
