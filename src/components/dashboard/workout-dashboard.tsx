"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { WorkoutSummary } from "@/data/workouts";

type Props = {
  // Plain YYYY-MM-DD string — no Date object to avoid UTC/local ambiguity
  selectedDateStr: string;
  selectedDate: Date;
  workouts: WorkoutSummary[];
  tz: string;
};

export function WorkoutDashboard({ selectedDateStr, selectedDate, workouts, tz }: Props) {
  // Parse YYYY-MM-DD as local midnight so format() shows the correct day
  const titleDate = parseISO(selectedDateStr);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Inject the browser's timezone into the URL so the server can use it
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTz && browserTz !== tz) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tz", browserTz);
      router.replace(`?${params.toString()}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    const params = new URLSearchParams(searchParams.toString());
    // Use local date parts to avoid UTC offset shifting the day
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    params.set("date", `${yyyy}-${mm}-${dd}`);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="size-4 mr-2" />
              {format(titleDate, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                handleDateSelect(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button asChild className="bg-black text-white rounded-md px-4 py-2 hover:bg-black/90">
          <Link href={`/dashboard/workout/new?date=${selectedDateStr}&tz=${encodeURIComponent(tz)}`}>Log New Workout</Link>
        </Button>
      </div>

      {/* Workout list */}
      <div>
        <h2 className="text-lg font-medium mb-4">
          Workouts for {format(titleDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground gap-4">
            <Dumbbell className="size-8 opacity-40" />
            <p className="text-sm">No workouts logged for this date.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => {
              const duration =
                workout.completed_at
                  ? differenceInMinutes(workout.completed_at, workout.started_at)
                  : null;

              return (
                <li key={workout.id}>
                  <Link
                    href={`/dashboard/workout/${workout.id}`}
                    className="block rounded-lg border bg-card px-5 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{workout.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(workout.started_at, "h:mm a")}
                      </span>
                    </div>

                    {workout.exercises.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {workout.exercises.map((ex) => (
                          <Badge key={ex} variant="secondary" className="text-xs font-normal">
                            {ex}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {duration !== null && (
                      <p className="text-xs text-muted-foreground">
                        Duration: {duration} min
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
