// Domain types for the FitBudd AI Workout Generator.
// Kept narrow on purpose so the AI output is predictable and easy to render.

export type Goal =
  | "Fat Loss"
  | "Muscle Building"
  | "Strength"
  | "Endurance"
  | "Mobility"
  | "Conditioning"
  | "Sport-Specific"
  | "General Fitness";

export type Location =
  | "Gym"
  | "Home"
  | "Outdoor"
  | "Hotel"
  | "No Equipment"
  | "Limited Equipment";

export type Intensity = "Low" | "Moderate" | "High";

export type WorkoutType =
  | "Strength"
  | "Hypertrophy"
  | "HIIT"
  | "Circuit"
  | "Mobility"
  | "Recovery"
  | "Tabata"
  | "EMOM"
  | "AMRAP"
  | "Sport-Specific Conditioning";

export type Duration = 15 | 20 | 30 | 45 | 60 | 75 | 90;

export type TargetArea =
  | "Full Body"
  | "Upper Body"
  | "Lower Body"
  | "Core"
  | "Glutes"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs";

export interface WorkoutInputs {
  clientName: string;
  goal: Goal | "";
  location: Location | "";
  intensity: Intensity | "";
  workoutType: WorkoutType | "";
  duration: Duration | "";
  age: number | "";
  targetAreas: TargetArea[];
  injuries: string;
}

export interface Exercise {
  exercise: string;
  sets: string;
  reps: string;
  rest: string;
  tempo?: string;
  notes: string;
  modification?: string;
}

export interface WarmupItem {
  movement: string;
  duration: string;
  notes?: string;
}

export interface WorkoutPlan {
  clientName: string;
  goal: string;
  duration: string;
  trainingFormat: string;
  goalSummary: string;
  warmup: WarmupItem[];
  mainWorkout: Exercise[];
  cooldown: WarmupItem[];
  progression: string;
  weeklySplitRecommendation: string;
  trainerNotes: string;
  disclaimer: string;
}

export type InputMode = "guided" | "chat";

export interface GenerateRequestBody {
  mode: InputMode;
  inputs?: WorkoutInputs;
  chatPrompt?: string;
}
