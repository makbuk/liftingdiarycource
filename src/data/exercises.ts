import { db } from "@/db";
import { exercises, workout_exercises, sets, workouts } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";

export type Set = {
  id: string;
  set_number: number;
  reps: number;
  weight: number;
};

export type WorkoutExerciseWithSets = {
  id: string;
  order: number;
  exercise: { id: string; name: string };
  sets: Set[];
};

export async function getAllExercises() {
  return db.select({ id: exercises.id, name: exercises.name }).from(exercises).orderBy(exercises.name);
}

export async function getWorkoutExercisesWithSets(workoutId: string, userId: string): Promise<WorkoutExerciseWithSets[]> {
  // Verify workout belongs to user
  const [workout] = await db.select({ id: workouts.id }).from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.user_id, userId)));
  if (!workout) return [];

  const rows = await db
    .select({
      we_id: workout_exercises.id,
      we_order: workout_exercises.order,
      ex_id: exercises.id,
      ex_name: exercises.name,
      set_id: sets.id,
      set_number: sets.set_number,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workout_exercises)
    .innerJoin(exercises, eq(exercises.id, workout_exercises.exercise_id))
    .leftJoin(sets, eq(sets.workout_exercise_id, workout_exercises.id))
    .where(eq(workout_exercises.workout_id, workoutId))
    .orderBy(workout_exercises.order, sets.set_number);

  const map = new Map<string, WorkoutExerciseWithSets>();
  for (const row of rows) {
    if (!map.has(row.we_id)) {
      map.set(row.we_id, {
        id: row.we_id,
        order: row.we_order,
        exercise: { id: row.ex_id, name: row.ex_name },
        sets: [],
      });
    }
    if (row.set_id) {
      map.get(row.we_id)!.sets.push({
        id: row.set_id,
        set_number: row.set_number!,
        reps: row.reps!,
        weight: row.weight!,
      });
    }
  }

  return Array.from(map.values());
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string, userId: string) {
  // Verify workout belongs to user
  const [workout] = await db.select({ id: workouts.id }).from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.user_id, userId)));
  if (!workout) throw new Error("Unauthorized");

  const [{ currentCount }] = await db
    .select({ currentCount: count() })
    .from(workout_exercises)
    .where(eq(workout_exercises.workout_id, workoutId));

  const [we] = await db
    .insert(workout_exercises)
    .values({ workout_id: workoutId, exercise_id: exerciseId, order: currentCount })
    .returning();
  return we;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string, userId: string) {
  // Verify parent workout belongs to user
  const [row] = await db
    .select({ user_id: workouts.user_id })
    .from(workout_exercises)
    .innerJoin(workouts, eq(workouts.id, workout_exercises.workout_id))
    .where(eq(workout_exercises.id, workoutExerciseId));
  if (!row || row.user_id !== userId) throw new Error("Unauthorized");

  await db.delete(workout_exercises).where(eq(workout_exercises.id, workoutExerciseId));
}

export async function addSet(workoutExerciseId: string, reps: number, weight: number, userId: string) {
  // Verify parent workout belongs to user
  const [row] = await db
    .select({ user_id: workouts.user_id })
    .from(workout_exercises)
    .innerJoin(workouts, eq(workouts.id, workout_exercises.workout_id))
    .where(eq(workout_exercises.id, workoutExerciseId));
  if (!row || row.user_id !== userId) throw new Error("Unauthorized");

  const [{ currentCount }] = await db
    .select({ currentCount: count() })
    .from(sets)
    .where(eq(sets.workout_exercise_id, workoutExerciseId));

  const [set] = await db
    .insert(sets)
    .values({ workout_exercise_id: workoutExerciseId, set_number: currentCount + 1, reps, weight })
    .returning();
  return set;
}

export async function deleteSet(setId: string, userId: string) {
  // Verify parent workout belongs to user and get workout_exercise_id for renumbering
  const [row] = await db
    .select({ user_id: workouts.user_id, workout_exercise_id: sets.workout_exercise_id })
    .from(sets)
    .innerJoin(workout_exercises, eq(workout_exercises.id, sets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workout_exercises.workout_id))
    .where(eq(sets.id, setId));
  if (!row || row.user_id !== userId) throw new Error("Unauthorized");

  await db.delete(sets).where(eq(sets.id, setId));

  // Renumber remaining sets sequentially
  const remaining = await db
    .select({ id: sets.id })
    .from(sets)
    .where(eq(sets.workout_exercise_id, row.workout_exercise_id))
    .orderBy(sets.set_number);

  for (let i = 0; i < remaining.length; i++) {
    await db.update(sets).set({ set_number: i + 1 }).where(eq(sets.id, remaining[i].id));
  }
}
