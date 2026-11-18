"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptBookingAction,
  rejectBookingAction,
  startBookingAction,
  completeBookingAction,
  cancelBookingAction,
} from "@/lib/actions/bookings";
import { Button } from "./ui";

export function BookingStatusActions({ bookingId, status }: { bookingId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: (fd: FormData) => Promise<unknown>, label?: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("bookingId", bookingId);
      await action(fd);
      router.refresh();
    });
  }

  if (pending) return <p className="text-sm text-ink-soft">Updating...</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <>
          <Button size="sm" onClick={() => run(acceptBookingAction)}>Accept</Button>
          <Button size="sm" variant="danger" onClick={() => run(rejectBookingAction)}>Reject</Button>
          <Button size="sm" variant="outline" onClick={() => run(cancelBookingAction)}>Cancel</Button>
        </>
      )}
      {status === "accepted" && (
        <>
          <Button size="sm" onClick={() => run(startBookingAction)}>Start job</Button>
          <Button size="sm" variant="outline" onClick={() => run(cancelBookingAction)}>Cancel</Button>
        </>
      )}
      {status === "in_progress" && (
        <Button size="sm" onClick={() => run(completeBookingAction)}>Mark completed</Button>
      )}
      {["completed", "rejected", "cancelled"].includes(status) && (
        <p className="text-sm text-ink-soft">No further actions for this booking.</p>
      )}
    </div>
  );
}
