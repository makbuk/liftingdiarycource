"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout, addSet, deleteSet } from "@/data/exercises";

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

const addExerciseSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(workoutId: string, exerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addExerciseSchema.safeParse({ workoutId, exerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  return addExerciseToWorkout(parsed.data.workoutId, parsed.data.exerciseId, userId);
}

const removeExerciseSchema = z.object({ workoutExerciseId: z.string().min(1) });

export async function removeExerciseFromWorkoutAction(workoutExerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = removeExerciseSchema.safeParse({ workoutExerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  return removeExerciseFromWorkout(parsed.data.workoutExerciseId, userId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0),
});

export async function addSetAction(workoutExerciseId: string, reps: number, weight: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addSetSchema.safeParse({ workoutExerciseId, reps, weight });
  if (!parsed.success) throw new Error("Invalid input");

  return addSet(parsed.data.workoutExerciseId, parsed.data.reps, parsed.data.weight, userId);
}

const deleteSetSchema = z.object({ setId: z.string().min(1) });

export async function deleteSetAction(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = deleteSetSchema.safeParse({ setId });
  if (!parsed.success) throw new Error("Invalid input");

  return deleteSet(parsed.data.setId, userId);
}
