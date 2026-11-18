import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, avg, count, eq } from "drizzle-orm";
import { MapPin, Star } from "lucide-react";
import { db } from "@/db";
import { services, serviceCategories, providerProfiles, users, reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, Avatar, StatusBadge } from "@/components/ui";
import { BookingForm } from "@/components/booking-form";
import { formatPrice } from "@/lib/constants";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, rows] = await Promise.all([
    getSessionUser(),
    db
      .select({
        id: services.id,
        title: services.title,
        description: services.description,
        price: services.price,
        priceUnit: services.priceUnit,
        isActive: services.isActive,
        categoryName: serviceCategories.name,
        providerId: providerProfiles.userId,
        providerName: users.name,
        businessName: providerProfiles.businessName,
        providerCity: providerProfiles.city,
        providerBio: providerProfiles.bio,
        providerPhoto: providerProfiles.photoUrl,
      })
      .from(services)
      .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId))
      .innerJoin(users, eq(services.providerId, users.id))
      .where(and(eq(services.id, id), eq(providerProfiles.status, "approved")))
      .limit(1),
  ]);
  const service = rows[0];
  if (!service) notFound();

  const [ratingRow] = await db
    .select({ rating: avg(reviews.rating), total: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.providerId, service.providerId));

  const recentReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      customerName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.customerId, users.id))
    .where(eq(reviews.providerId, service.providerId))
    .orderBy(reviews.createdAt)
    .limit(5);

  const rating = ratingRow?.rating ? Number(ratingRow.rating) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <span className="rounded-full bg-blue/10 px-2.5 py-1 text-xs font-medium text-blue">
                {service.categoryName}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy">{service.title}</h1>
              <p className="mt-3 leading-relaxed text-ink-soft">{service.description}</p>
            </div>

            <Card className="p-6">
              <h2 className="font-semibold text-ink">About the provider</h2>
              <div className="mt-4 flex items-start gap-4">
                <Avatar name={service.businessName} src={service.providerPhoto} size="lg" />
                <div>
                  <p className="font-semibold text-ink">
                    <a href={`/providers/${service.providerId}`} className="hover:text-blue">
                      {service.businessName}
                    </a>
                  </p>
                  <p className="flex items-center gap-1 text-sm text-ink-soft">
                    {service.providerCity && (
                      <>
                        <MapPin className="h-3.5 w-3.5" /> {service.providerCity}
                      </>
                    )}
                  </p>
                  {rating !== null && (
                    <p className="mt-1 flex items-center gap-1 text-sm font-medium text-ink">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {rating.toFixed(1)}
                      <span className="font-normal text-ink-soft">({ratingRow?.total} reviews)</span>
                    </p>
                  )}
                  {service.providerBio && <p className="mt-2 text-sm text-ink-soft">{service.providerBio}</p>}
                </div>
              </div>
            </Card>

            {recentReviews.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-ink">Recent reviews</h2>
                <div className="mt-4 space-y-4">
                  {recentReviews.map((r) => (
                    <div key={r.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{r.customerName}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24 p-6">
              <p className="text-3xl font-bold text-navy">
                {formatPrice(service.price)}
                <span className="text-sm font-normal text-ink-soft"> / {service.priceUnit}</span>
              </p>
              {!service.isActive ? (
                <p className="mt-4 text-sm text-ink-soft">This service is currently unavailable.</p>
              ) : user?.role === "customer" ? (
                <div className="mt-4">
                  <BookingForm serviceId={service.id} />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-ink-soft">
                    {user ? "Log in as a customer to book this service." : "Log in or create an account to book this service."}
                  </p>
                  <a
                    href={user ? "/login" : "/login?next=/services/" + service.id}
                    className="flex w-full items-center justify-center rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-dark"
                  >
                    Log in to book
                  </a>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
