import { db } from "@/db";
import { workouts, workout_exercises, exercises } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "Missing date param" }, { status: 400 });
  }

  const date = new Date(dateParam);
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

  // Group exercises under each workout
  const workoutMap = new Map<string, {
    id: string;
    name: string;
    started_at: string;
    completed_at: string | null;
    exercises: string[];
  }>();

  for (const row of rows) {
    if (!workoutMap.has(row.workout_id)) {
      workoutMap.set(row.workout_id, {
        id: row.workout_id,
        name: row.workout_name,
        started_at: row.started_at.toISOString(),
        completed_at: row.completed_at?.toISOString() ?? null,
        exercises: [],
      });
    }
    if (row.exercise_name) {
      workoutMap.get(row.workout_id)!.exercises.push(row.exercise_name);
    }
  }

  return NextResponse.json(Array.from(workoutMap.values()));
}
