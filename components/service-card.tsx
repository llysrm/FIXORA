import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "./ui";
import { formatPrice, formatReviewCount, formatServiceCount } from "@/lib/constants";
import type { Lang } from "@/lib/constants";

export type ServiceCardData = {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  categoryName: string;
  providerName: string;
  providerId: string;
  providerCity: string | null;
  rating: number | null;
  reviewCount: number;
};

const unitLabels: Record<string, { en: string; id: string }> = {
  visit: { en: "visit", id: "kunjungan" },
  hour: { en: "hour", id: "jam" },
};

export function ServiceCard({ service, lang = "id" }: { service: ServiceCardData; lang?: Lang }) {
  const unit = unitLabels[service.priceUnit]?.[lang] ?? service.priceUnit;
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue/10 px-2.5 py-1 text-xs font-medium text-blue">
          {service.categoryName}
        </span>
        {service.reviewCount > 0 && (
          <span className="flex items-center gap-1 text-sm font-medium text-ink">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {service.rating?.toFixed(1)}
            <span className="text-xs font-normal text-ink-soft">({formatReviewCount(service.reviewCount, lang)})</span>
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-ink">
        <Link href={`/services/${service.id}`} className="hover:text-blue">
          {service.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{service.description}</p>
      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-lg font-bold text-navy">
            {formatPrice(service.price)}
            <span className="text-xs font-normal text-ink-soft"> / {unit}</span>
          </p>
          <p className="text-xs text-ink-soft">
            {lang === "id" ? "oleh" : "by"}{" "}
            <Link href={`/providers/${service.providerId}`} className="hover:text-blue">
              {service.providerName}
            </Link>
            {service.providerCity ? ` · ${service.providerCity}` : ""}
          </p>
        </div>
        <Link
          href={`/services/${service.id}`}
          className="rounded-lg bg-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-dark"
        >
          {lang === "id" ? "Pesan" : "Book"}
        </Link>
      </div>
    </Card>
  );
}
