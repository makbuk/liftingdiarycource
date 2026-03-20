import { db } from "@/db";
import { workouts, workout_exercises, exercises } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ user_id: userId, name, started_at: startedAt })
    .returning();
  return workout;
}

export type WorkoutSummary = {
  id: string;
  name: string;
  started_at: Date;
  completed_at: Date | null;
  exercises: string[];
};

export async function getWorkoutsForUserByDate(
  userId: string,
  date: Date
): Promise<WorkoutSummary[]> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const rows = await db
    .select({
      workout_id: workouts.id,
      workout_name: workouts.name,
      started_at: workouts.started_at,
      completed_at: workouts.completed_at,
      exercise_name: exercises.name,
    })
    .from(workouts)
    .leftJoin(workout_exercises, eq(workout_exercises.workout_id, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workout_exercises.exercise_id))
    .where(
      and(
        eq(workouts.user_id, userId),
        gte(workouts.started_at, dayStart),
        lt(workouts.started_at, dayEnd)
      )
    )
    .orderBy(workouts.started_at, workout_exercises.order);

  const workoutMap = new Map<string, WorkoutSummary>();

  for (const row of rows) {
    if (!workoutMap.has(row.workout_id)) {
      workoutMap.set(row.workout_id, {
        id: row.workout_id,
        name: row.workout_name,
        started_at: row.started_at,
        completed_at: row.completed_at ?? null,
        exercises: [],
      });
    }
    if (row.exercise_name) {
      workoutMap.get(row.workout_id)!.exercises.push(row.exercise_name);
    }
  }

  return Array.from(workoutMap.values());
}
