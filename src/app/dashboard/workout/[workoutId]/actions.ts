"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  startedAt: z.date(),
});

export async function updateWorkoutAction(workoutId: string, name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateWorkoutSchema.safeParse({ name, startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  return updateWorkout(workoutId, userId, parsed.data.name, parsed.data.startedAt);
}
