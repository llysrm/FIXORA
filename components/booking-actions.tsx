"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { Button } from "./ui";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancel this booking? This cannot be undone.")) return;
        startTransition(async () => {
          const fd = new FormData();
          fd.set("bookingId", bookingId);
          await cancelBookingAction(fd);
          router.refresh();
        });
      }}
    >
      {pending ? "Cancelling..." : "Cancel booking"}
    </Button>
  );
}
