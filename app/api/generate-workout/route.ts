import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai";
import { parseWorkoutPlan } from "@/lib/parseWorkout";
import {
  WORKOUT_SYSTEM_PROMPT,
  buildChatUserPrompt,
  buildGuidedUserPrompt,
} from "@/lib/prompts";
import type { GenerateRequestBody, WorkoutInputs } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateGuidedInputs(inputs: WorkoutInputs | undefined): string | null {
  if (!inputs) return "Missing inputs.";
  const required: (keyof WorkoutInputs)[] = [
    "clientName",
    "goal",
    "location",
    "intensity",
    "workoutType",
    "duration",
    "age",
  ];
  for (const key of required) {
    const v = inputs[key];
    if (v === "" || v === undefined || v === null) {
      return `Missing required field: ${key}`;
    }
  }
  if (!inputs.targetAreas || inputs.targetAreas.length === 0) {
    return "Select at least one target area.";
  }
  const age = typeof inputs.age === "number" ? inputs.age : Number(inputs.age);
  if (!Number.isFinite(age) || age < 10 || age > 99) {
    return "Age must be between 10 and 99.";
  }
  return null;
}

export async function POST(req: Request) {
  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.mode === "guided") {
    const err = validateGuidedInputs(body.inputs);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  } else if (body.mode === "chat") {
    if (!body.chatPrompt || body.chatPrompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Describe the client in at least a sentence so we can build a plan." },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
  }

  const userPrompt =
    body.mode === "guided"
      ? buildGuidedUserPrompt(body.inputs as WorkoutInputs)
      : buildChatUserPrompt(body.chatPrompt as string);

  try {
    const { text, provider } = await generateCompletion({
      systemPrompt: WORKOUT_SYSTEM_PROMPT,
      userPrompt,
      // Gemini 2.0 Flash caps output at 8192 tokens. A full plan rarely needs
      // this much, but chat-mode plans were truncating at 3200 → MAX_TOKENS.
      maxTokens: 8000,
      temperature: 0.55,
    });
    const plan = parseWorkoutPlan(text);
    return NextResponse.json({ plan, provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error generating workout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
