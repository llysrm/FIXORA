"use client";

import { useActionState, useState } from "react";
import { submitReviewAction } from "@/lib/actions/bookings";
import type { ActionState } from "@/lib/actions/auth";
import { Textarea, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";
import { Star } from "lucide-react";

const initial: ActionState = {};

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState(submitReviewAction, initial);
  const [rating, setRating] = useState(0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <div>
        <Label>Rating</Label>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              className="rounded p-0.5"
            >
              <Star
                className={`h-7 w-7 ${n <= rating ? "fill-warning text-warning" : "text-line"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea id="comment" name="comment" rows={3} placeholder="How was the service?" />
      </div>
      <SubmitButton disabled={rating === 0}>Submit review</SubmitButton>
    </form>
  );
}
