"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { SAMPLE_INPUTS } from "@/lib/sample";
import type {
  Duration,
  Goal,
  Intensity,
  Location,
  TargetArea,
  WorkoutInputs,
  WorkoutType,
} from "@/lib/types";

const GOALS: Goal[] = [
  "Fat Loss",
  "Muscle Building",
  "Strength",
  "Endurance",
  "Mobility",
  "Conditioning",
  "Sport-Specific",
  "General Fitness",
];

const LOCATIONS: Location[] = [
  "Gym",
  "Home",
  "Outdoor",
  "Hotel",
  "No Equipment",
  "Limited Equipment",
];

const INTENSITIES: Intensity[] = ["Low", "Moderate", "High"];

const TYPES: WorkoutType[] = [
  "Strength",
  "Hypertrophy",
  "HIIT",
  "Circuit",
  "Mobility",
  "Recovery",
  "Tabata",
  "EMOM",
  "AMRAP",
  "Sport-Specific Conditioning",
];

const DURATIONS: Duration[] = [15, 20, 30, 45, 60, 75, 90];

const TARGET_AREAS: TargetArea[] = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Core",
  "Glutes",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
];

const EMPTY: WorkoutInputs = {
  clientName: "",
  goal: "",
  location: "",
  intensity: "",
  workoutType: "",
  duration: "",
  age: "",
  targetAreas: [],
  injuries: "",
};

interface Props {
  loading: boolean;
  onSubmit: (inputs: WorkoutInputs) => void;
}

export function GuidedForm({ loading, onSubmit }: Props) {
  const [inputs, setInputs] = useState<WorkoutInputs>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof WorkoutInputs, string>>>({});

  function update<K extends keyof WorkoutInputs>(key: K, value: WorkoutInputs[K]) {
    setInputs((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof WorkoutInputs, string>> = {};
    if (!inputs.clientName.trim()) next.clientName = "Required";
    if (!inputs.goal) next.goal = "Required";
    if (!inputs.location) next.location = "Required";
    if (!inputs.intensity) next.intensity = "Required";
    if (!inputs.workoutType) next.workoutType = "Required";
    if (!inputs.duration) next.duration = "Required";
    if (inputs.age === "" || Number(inputs.age) < 10 || Number(inputs.age) > 99)
      next.age = "10–99";
    if (inputs.targetAreas.length === 0) next.targetAreas = "Pick one";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(inputs);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <Field
        label="Client Name"
        required
        error={errors.clientName}
        htmlFor="clientName"
      >
        <Input
          id="clientName"
          placeholder="Enter client name"
          value={inputs.clientName}
          onChange={(e) => update("clientName", e.target.value)}
          invalid={!!errors.clientName}
        />
      </Field>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
        <Field label="Goal" required error={errors.goal}>
          <Select
            placeholder="Select goal"
            value={inputs.goal}
            invalid={!!errors.goal}
            onChange={(e) => update("goal", e.target.value as Goal)}
            options={GOALS.map((g) => ({ value: g, label: g }))}
          />
        </Field>

        <Field label="Location" required error={errors.location}>
          <Select
            placeholder="Location"
            value={inputs.location}
            invalid={!!errors.location}
            onChange={(e) => update("location", e.target.value as Location)}
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          />
        </Field>

        <Field label="Intensity" required error={errors.intensity}>
          <Select
            placeholder="Intensity"
            value={inputs.intensity}
            invalid={!!errors.intensity}
            onChange={(e) => update("intensity", e.target.value as Intensity)}
            options={INTENSITIES.map((i) => ({ value: i, label: i }))}
          />
        </Field>

        <Field label="Type" required error={errors.workoutType}>
          <Select
            placeholder="Type"
            value={inputs.workoutType}
            invalid={!!errors.workoutType}
            onChange={(e) => update("workoutType", e.target.value as WorkoutType)}
            options={TYPES.map((t) => ({ value: t, label: t }))}
          />
        </Field>

        <Field label="Duration" required error={errors.duration}>
          <Select
            placeholder="Duration"
            value={inputs.duration === "" ? "" : String(inputs.duration)}
            invalid={!!errors.duration}
            onChange={(e) =>
              update("duration", Number(e.target.value) as Duration)
            }
            options={DURATIONS.map((d) => ({
              value: String(d),
              label: `${d} min`,
            }))}
          />
        </Field>

        <Field label="Age" required error={errors.age}>
          <Input
            type="number"
            inputMode="numeric"
            min={10}
            max={99}
            placeholder="Age"
            value={inputs.age === "" ? "" : String(inputs.age)}
            invalid={!!errors.age}
            onChange={(e) =>
              update("age", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </Field>
      </div>

      <Field label="Target Area" required error={errors.targetAreas}>
        <Select
          placeholder="Select target area"
          value={inputs.targetAreas[0] ?? ""}
          invalid={!!errors.targetAreas}
          onChange={(e) => {
            const v = e.target.value as TargetArea;
            update("targetAreas", v ? [v] : []);
          }}
          options={TARGET_AREAS.map((a) => ({ value: a, label: a }))}
        />
      </Field>

      <Field
        label="Injuries / Limitations / Notes"
        hint="Optional. Equipment, preferences, anything to work around."
      >
        <Textarea
          rows={3}
          placeholder="e.g. mild knee discomfort on deep squats; only has dumbbells; prefers no jumping"
          value={inputs.injuries}
          onChange={(e) => update("injuries", e.target.value)}
        />
      </Field>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setInputs(SAMPLE_INPUTS)}
          className="text-[11px] text-ink-dim hover:text-ink underline-offset-4 hover:underline"
        >
          Use sample
        </button>
        <Button type="submit" size="lg" loading={loading} className="flex-1 max-w-[220px]">
          Generate Workout
        </Button>
      </div>
    </form>
  );
}
