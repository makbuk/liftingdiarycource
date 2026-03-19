import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { format, parseISO } from "date-fns";
import { getWorkoutsForUserByDate } from "@/data/workouts";
import { WorkoutDashboard } from "@/components/dashboard/workout-dashboard";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  // Always work with a plain YYYY-MM-DD string to avoid UTC/local shifts
  const selectedDateStr = dateParam ?? format(new Date(), "yyyy-MM-dd");
  // parseISO interprets YYYY-MM-DD as local midnight
  const selectedDate = parseISO(selectedDateStr);

  const workouts = await getWorkoutsForUserByDate(userId, selectedDate);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>
      <h2 className="text-xl font-semibold mb-8">Select Date</h2>
      <Suspense>
        <WorkoutDashboard
          selectedDateStr={selectedDateStr}
          selectedDate={selectedDate}
          workouts={workouts}
        />
      </Suspense>
    </div>
  );
}
