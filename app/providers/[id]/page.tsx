import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, avg, count, desc, eq } from "drizzle-orm";
import { MapPin, Star } from "lucide-react";
import { db } from "@/db";
import { providerProfiles, users, services, serviceCategories, reviews, bookings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, Avatar } from "@/components/ui";
import { ServiceCard, type ServiceCardData } from "@/components/service-card";
import { StartChatButton } from "@/components/start-chat-button";
import { formatDate, formatReviewCount } from "@/lib/constants";
import { getLang } from "@/lib/lang";

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const [user, rows] = await Promise.all([
    getSessionUser(),
    db
      .select({
        userId: providerProfiles.userId,
        businessName: providerProfiles.businessName,
        bio: providerProfiles.bio,
        city: providerProfiles.city,
        photoUrl: providerProfiles.photoUrl,
        name: users.name,
        status: providerProfiles.status,
      })
      .from(providerProfiles)
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(eq(providerProfiles.userId, id))
      .limit(1),
  ]);
  const provider = rows[0];
  if (!provider || provider.status !== "approved") notFound();

  const activeServices = await db
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
    .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId))
    .leftJoin(reviews, eq(reviews.providerId, services.providerId))
    .where(and(eq(services.providerId, id), eq(services.isActive, true), eq(providerProfiles.status, "approved")))
    .groupBy(services.id, serviceCategories.name, providerProfiles.userId)
    .orderBy(desc(services.createdAt));

  const providerReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      customerName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.customerId, users.id))
    .where(eq(reviews.providerId, id))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  const [stats] = await db
    .select({ rating: avg(reviews.rating), total: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.providerId, id));

  const items: ServiceCardData[] = activeServices.map((s) => ({
    ...s,
    rating: s.rating ? Number(s.rating) : null,
    reviewCount: Number(s.reviewCount),
  }));
  const rating = stats?.rating ? Number(stats.rating) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar name={provider.businessName} src={provider.photoUrl} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-navy">{provider.businessName}</h1>
              <p className="mt-1 text-sm text-ink-soft">Run by {provider.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                {provider.city && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {provider.city}</span>
                )}
                {rating !== null && (
                  <span className="flex items-center gap-1 font-medium text-ink">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {rating.toFixed(1)}
                    <span className="font-normal text-ink-soft">({formatReviewCount(Number(stats?.total || 0), lang)})</span>
                  </span>
                )}
              </div>
              {provider.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{provider.bio}</p>}
            </div>
            {user?.role === "customer" && (
              <StartChatButton providerId={provider.userId} />
            )}
          </div>
        </Card>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-navy">Services</h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">This provider has no active services right now.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <ServiceCard key={s.id} service={s} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {providerReviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-navy">Reviews</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {providerReviews.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{r.customerName}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
                  <p className="mt-2 text-xs text-ink-soft">{formatDate(r.createdAt, lang)}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
