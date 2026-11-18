import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Avatar, Card } from "./ui";

export type ProviderCardData = {
  userId: string;
  businessName: string;
  name: string;
  city: string | null;
  bio: string | null;
  photoUrl: string | null;
  serviceCount: number;
  rating: number | null;
  reviewCount: number;
};

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-center gap-3">
        <Avatar name={provider.businessName} src={provider.photoUrl} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink">
            <Link href={`/providers/${provider.userId}`} className="hover:text-blue">
              {provider.businessName}
            </Link>
          </h3>
          <p className="flex items-center gap-1 text-xs text-ink-soft">
            {provider.city ? (
              <>
                <MapPin className="h-3.5 w-3.5" /> {provider.city}
              </>
            ) : (
              "Location not set"
            )}
          </p>
        </div>
      </div>
      {provider.bio && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{provider.bio}</p>}
      <div className="mt-auto flex items-center justify-between pt-4 text-sm">
        <span className="text-ink-soft">
          {provider.serviceCount} service{provider.serviceCount === 1 ? "" : "s"}
        </span>
        {provider.reviewCount > 0 ? (
          <span className="flex items-center gap-1 font-medium text-ink">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {provider.rating?.toFixed(1)}
            <span className="text-xs font-normal text-ink-soft">({provider.reviewCount})</span>
          </span>
        ) : (
          <span className="text-xs text-ink-soft">New provider</span>
        )}
      </div>
    </Card>
  );
}
