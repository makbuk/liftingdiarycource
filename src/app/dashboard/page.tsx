import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getWorkoutsForUserByDate } from "@/data/workouts";
import { WorkoutDashboard } from "@/components/dashboard/workout-dashboard";

type Props = {
  searchParams: Promise<{ date?: string; tz?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam, tz: tzParam } = await searchParams;
  const tz = tzParam ?? "UTC";
  // Default to today in the user's timezone
  const selectedDateStr = dateParam ?? formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  const selectedDate = parseISO(selectedDateStr);

  const workouts = await getWorkoutsForUserByDate(userId, selectedDate, tz);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>
      <h2 className="text-xl font-semibold mb-8">Select Date</h2>
      <Suspense>
        <WorkoutDashboard
          selectedDateStr={selectedDateStr}
          selectedDate={selectedDate}
          workouts={workouts}
          tz={tz}
        />
      </Suspense>
    </div>
  );
}
