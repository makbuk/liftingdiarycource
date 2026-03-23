"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSetAction, deleteSetAction, removeExerciseFromWorkoutAction } from "./actions";
import type { WorkoutExerciseWithSets } from "@/data/exercises";

type Props = {
  workoutExercises: WorkoutExerciseWithSets[];
};

function AddSetForm({ workoutExerciseId }: { workoutExerciseId: string }) {
  const router = useRouter();
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    const repsNum = parseInt(reps, 10);
    const weightNum = parseFloat(weight);
    if (!reps || isNaN(repsNum) || repsNum < 1) {
      setError("Enter valid reps.");
      return;
    }
    if (weight === "" || isNaN(weightNum) || weightNum < 0) {
      setError("Enter valid weight.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await addSetAction(workoutExerciseId, repsNum, weightNum);
        setReps("");
        setWeight("");
        router.refresh();
      } catch {
        setError("Failed to add set.");
      }
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Reps</Label>
          <Input
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="10"
            className="w-20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Weight (kg)</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="60"
            className="w-24"
          />
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={pending}>
          Log Set
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ExerciseCard({ we }: { we: WorkoutExerciseWithSets }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction(we.id);
      router.refresh();
    });
  }

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction(setId);
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{we.exercise.name}</h3>
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={pending} className="text-destructive hover:text-destructive">
          Remove
        </Button>
      </div>

      {we.sets.length > 0 && (
        <div className="space-y-1">
          {we.sets.map((set) => (
            <div key={set.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Set {set.set_number}:</span>
              <span className="font-medium">{set.reps} reps × {set.weight} kg</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSet(set.id)}
                disabled={pending}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      {we.sets.length === 0 && (
        <p className="text-sm text-muted-foreground">No sets logged yet.</p>
      )}

      <AddSetForm workoutExerciseId={we.id} />
    </div>
  );
}

export function ExerciseList({ workoutExercises }: Props) {
  if (workoutExercises.length === 0) {
    return <p className="text-muted-foreground text-sm">No exercises added yet. Add one above.</p>;
  }

  return (
    <div className="space-y-4">
      {workoutExercises.map((we) => (
        <ExerciseCard key={we.id} we={we} />
      ))}
    </div>
  );
}
