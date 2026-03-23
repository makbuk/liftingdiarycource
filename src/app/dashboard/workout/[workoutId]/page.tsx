import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getAllExercises, getWorkoutExercisesWithSets } from "@/data/exercises";
import { EditWorkoutForm } from "./edit-workout-form";
import { AddExerciseForm } from "./add-exercise-form";
import { ExerciseList } from "./exercise-list";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const [workout, allExercises, workoutExercises] = await Promise.all([
    getWorkoutById(workoutId, userId),
    getAllExercises(),
    getWorkoutExercisesWithSets(workoutId, userId),
  ]);
  if (!workout) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold mb-8">Edit Workout</h1>
        <EditWorkoutForm
          workoutId={workout.id}
          initialName={workout.name}
          initialDate={workout.started_at}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Exercises</h2>
        <AddExerciseForm workoutId={workoutId} allExercises={allExercises} />
        <ExerciseList workoutExercises={workoutExercises} />
      </section>
    </div>
  );
}
