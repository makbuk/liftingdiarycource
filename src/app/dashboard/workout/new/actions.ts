"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  startedAt: z.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.safeParse({ name, startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  return createWorkout(userId, parsed.data.name, parsed.data.startedAt);
}
