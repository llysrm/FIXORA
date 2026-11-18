import Link from "next/link";
import { Wrench } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
        <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        {APP_NAME}
      </span>
    </Link>
  );
}
