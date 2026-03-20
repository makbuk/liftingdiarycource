"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutSummary } from "@/data/workouts";

type Props = {
  // Plain YYYY-MM-DD string — no Date object to avoid UTC/local ambiguity
  selectedDateStr: string;
  selectedDate: Date;
  workouts: WorkoutSummary[];
};

export function WorkoutDashboard({ selectedDateStr, selectedDate, workouts }: Props) {
  // Parse YYYY-MM-DD as local midnight so format() shows the correct day
  const titleDate = parseISO(selectedDateStr);
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
      {/* Left: Calendar */}
      <div className="rounded-lg border bg-card p-4 w-fit">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
        />
      </div>

      {/* Right: Workout list */}
      <div>
        <h2 className="text-lg font-medium mb-4">
          Workouts for {format(titleDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground gap-4">
            <Dumbbell className="size-8 opacity-40" />
            <p className="text-sm">No workouts logged for this date.</p>
            {/* TODO: link to /dashboard/workout/new or open a modal */}
            <Button className="bg-black text-white rounded-md px-4 py-2 hover:bg-black/90">
              Log New Workout
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => {
              const duration =
                workout.completed_at
                  ? differenceInMinutes(workout.completed_at, workout.started_at)
                  : null;

              return (
                <li
                  key={workout.id}
                  className="rounded-lg border bg-card px-5 py-4"
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
