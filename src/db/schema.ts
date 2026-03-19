import { pgTable, text, integer, real, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
};

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ...timestamps,
}, (t) => [
  uniqueIndex("exercises_name_unique").on(t.name),
]);

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  started_at: timestamp("started_at", { withTimezone: true }).notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [
  index("workouts_user_id_idx").on(t.user_id),
  index("workouts_started_at_idx").on(t.started_at),
  index("workouts_user_started_at_idx").on(t.user_id, t.started_at),
]);

export const workout_exercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workout_id: uuid("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exercise_id: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").notNull().default(0),
  ...timestamps,
}, (t) => [
  index("workout_exercises_workout_id_idx").on(t.workout_id),
  index("workout_exercises_exercise_id_idx").on(t.exercise_id),
]);

export const sets = pgTable("sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workout_exercise_id: uuid("workout_exercise_id").notNull().references(() => workout_exercises.id, { onDelete: "cascade" }),
  set_number: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(),
  ...timestamps,
}, (t) => [
  index("sets_workout_exercise_id_idx").on(t.workout_exercise_id),
]);

export const workoutsRelations = relations(workouts, ({ many }) => ({ workout_exercises: many(workout_exercises) }));
export const exercisesRelations = relations(exercises, ({ many }) => ({ workout_exercises: many(workout_exercises) }));
export const workoutExercisesRelations = relations(workout_exercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workout_exercises.workout_id], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workout_exercises.exercise_id], references: [exercises.id] }),
  sets: many(sets),
}));
export const setsRelations = relations(sets, ({ one }) => ({
  workout_exercise: one(workout_exercises, { fields: [sets.workout_exercise_id], references: [workout_exercises.id] }),
}));
