import type { WorkoutInputs, WorkoutPlan } from "./types";

// Used by the "Try sample data" button to demo the form without an API key.
export const SAMPLE_INPUTS: WorkoutInputs = {
  clientName: "Alex Morgan",
  goal: "Fat Loss",
  location: "Home",
  intensity: "Moderate",
  workoutType: "Circuit",
  duration: 45,
  age: 35,
  targetAreas: ["Full Body"],
  injuries:
    "Mild left knee discomfort on deep squats. Only dumbbells and a yoga mat. Prefers no jumping.",
};

// Realistic shape used as a fallback so the UI is visible even without an
// API key. The real flow uses the API route + AI provider.
export const SAMPLE_PLAN: WorkoutPlan = {
  clientName: "Alex Morgan",
  goal: "Fat Loss",
  duration: "45 minutes",
  trainingFormat: "Low-impact full-body dumbbell circuit",
  goalSummary:
    "A 45-minute moderate-intensity circuit designed for fat loss at home with one pair of dumbbells. Movements avoid jumping and deep knee flexion to protect the left knee.",
  warmup: [
    { movement: "Cat–cow", duration: "1 min", notes: "Slow, controlled breathing" },
    { movement: "Glute bridge", duration: "1 min" },
    { movement: "World's greatest stretch", duration: "1 min/side" },
    { movement: "Marching in place", duration: "2 min", notes: "No jumping" },
  ],
  mainWorkout: [
    {
      exercise: "Goblet box squat (to chair height)",
      sets: "4",
      reps: "10",
      rest: "45 sec",
      tempo: "3-1-1",
      notes: "Sit to a stable surface; keep knees tracking over toes.",
      modification: "Bodyweight box squat if knee is sore today.",
    },
    {
      exercise: "Dumbbell Romanian deadlift",
      sets: "4",
      reps: "10",
      rest: "45 sec",
      notes: "Hinge from hips, soft knees, neutral spine.",
    },
    {
      exercise: "Single-arm dumbbell row",
      sets: "3",
      reps: "12/side",
      rest: "30 sec",
      notes: "Drive elbow to hip, square shoulders.",
    },
    {
      exercise: "Floor dumbbell press",
      sets: "3",
      reps: "12",
      rest: "30 sec",
      notes: "Elbows ~45° from torso.",
      modification: "Push-up to knees if shoulders are fatigued.",
    },
    {
      exercise: "Reverse lunge (short stance)",
      sets: "3",
      reps: "8/side",
      rest: "45 sec",
      notes: "Step short to keep tension off the left knee.",
      modification: "Split stance squat to comfortable depth.",
    },
    {
      exercise: "Dead bug",
      sets: "3",
      reps: "8/side",
      rest: "30 sec",
      notes: "Ribs down, low back glued to floor.",
    },
  ],
  cooldown: [
    { movement: "Couch stretch", duration: "1 min/side" },
    { movement: "Child's pose", duration: "1 min" },
    { movement: "Box breathing", duration: "2 min", notes: "4-4-4-4 pattern" },
  ],
  progression:
    "Add 1 rep per set each week for 3 weeks, then increase dumbbell load by ~10% and reset reps.",
  weeklySplitRecommendation:
    "Run this circuit 3x/week on non-consecutive days with a 30–45 min easy walk on off days.",
  trainerNotes:
    "Check in on knee response after session 1; if any sharp pain, swap split squats for glute bridges.",
  disclaimer:
    "General fitness guidance only. Not medical advice. Stop and consult a qualified professional if you experience pain, dizziness, or unusual symptoms.",
};
