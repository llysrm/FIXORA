"use client";

import { saveAvailabilityAction } from "@/lib/actions/services";
import { DAYS } from "@/lib/constants";
import { Input, Label } from "./ui";
import { SubmitButton } from "./submit-button";

type DayRow = { day: number; isActive: boolean; startTime: string; endTime: string };

export function AvailabilityForm({ initial }: { initial: DayRow[] }) {
  return (
    <form action={saveAvailabilityAction} className="space-y-4">
      {initial.map((row) => (
        <div key={row.day} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
          <label className="flex w-32 items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name={`day-${row.day}`}
              defaultChecked={row.isActive}
              className="h-4 w-4 rounded border-line text-navy focus:ring-navy"
            />
            {DAYS[row.day]}
          </label>
          <div>
            <Label htmlFor={`start-${row.day}`} className="sr-only">Start</Label>
            <Input id={`start-${row.day}`} name={`start-${row.day}`} type="time" defaultValue={row.startTime} className="w-32" />
          </div>
          <span className="text-sm text-ink-soft">to</span>
          <div>
            <Label htmlFor={`end-${row.day}`} className="sr-only">End</Label>
            <Input id={`end-${row.day}`} name={`end-${row.day}`} type="time" defaultValue={row.endTime} className="w-32" />
          </div>
        </div>
      ))}
      <SubmitButton>Save availability</SubmitButton>
    </form>
  );
}
