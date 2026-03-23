import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { parseISO } from "date-fns";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date } = await searchParams;
  const initialDate = date ? parseISO(date) : undefined;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">New Workout</h1>
      <NewWorkoutForm initialDate={initialDate} />
    </div>
  );
}
