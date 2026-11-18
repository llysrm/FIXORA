"use client";

import { Button } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-ink-soft">
        {error.message.includes("UNAUTHORIZED")
          ? "Please log in to continue."
          : error.message.includes("FORBIDDEN")
            ? "You do not have access to this page."
            : "An unexpected error occurred. Try again."}
      </p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
