import type { WorkoutPlan } from "./types";

// The AI is instructed to return raw JSON, but models occasionally wrap output
// in ```json fences or include surrounding prose. Strip that defensively and
// throw a useful error if we still can't parse.
export function parseWorkoutPlan(raw: string): WorkoutPlan {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI returned an empty response.");
  }

  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI did not return valid JSON. Try regenerating.");
  }

  const plan = parsed as Partial<WorkoutPlan>;
  if (!plan || typeof plan !== "object") {
    throw new Error("AI response was not an object.");
  }
  if (!Array.isArray(plan.mainWorkout) || plan.mainWorkout.length === 0) {
    throw new Error("AI response is missing a main workout.");
  }

  return {
    clientName: plan.clientName ?? "",
    goal: plan.goal ?? "",
    duration: plan.duration ?? "",
    trainingFormat: plan.trainingFormat ?? "",
    goalSummary: plan.goalSummary ?? "",
    warmup: plan.warmup ?? [],
    mainWorkout: plan.mainWorkout,
    cooldown: plan.cooldown ?? [],
    progression: plan.progression ?? "",
    weeklySplitRecommendation: plan.weeklySplitRecommendation ?? "",
    trainerNotes: plan.trainerNotes ?? "",
    disclaimer:
      plan.disclaimer ??
      "This plan is for general fitness guidance and is not medical advice. Stop and consult a qualified professional if you experience pain, dizziness, or unusual symptoms.",
  };
}
