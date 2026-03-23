"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addExerciseToWorkoutAction } from "./actions";

type Exercise = { id: string; name: string };

type Props = {
  workoutId: string;
  allExercises: Exercise[];
};

export function AddExerciseForm({ workoutId, allExercises }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selectedId) {
      setError("Please select an exercise.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await addExerciseToWorkoutAction(workoutId, selectedId);
        setSelectedId("");
        router.refresh();
      } catch {
        setError("Failed to add exercise.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="exercise-select">Add Exercise</Label>
      <div className="flex gap-2">
        <select
          id="exercise-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select an exercise…</option>
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
        <Button onClick={handleSubmit} disabled={pending}>
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
