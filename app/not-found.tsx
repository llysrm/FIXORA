import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="font-mono text-sm text-blue">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 text-sm text-ink-soft">The page you are looking for does not exist or moved.</p>
      <ButtonLink href="/" className="mt-6">Back to home</ButtonLink>
    </div>
  );
}
