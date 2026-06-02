"use client";

import { useState } from "react";
import { Tabs } from "./Tabs";
import { GuidedForm } from "./GuidedForm";
import { ChatMode } from "./ChatMode";
import { WorkoutOutput } from "./WorkoutOutput";
import type { InputMode, WorkoutInputs, WorkoutPlan } from "@/lib/types";

export function Generator() {
  const [mode, setMode] = useState<InputMode>("guided");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate(body: object) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setPlan(data.plan as WorkoutPlan);
      requestAnimationFrame(() => {
        document.getElementById("workout-output")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate workout.");
    } finally {
      setLoading(false);
    }
  }

  function handleGuided(inputs: WorkoutInputs) {
    generate({ mode: "guided", inputs });
  }
  function handleChat(prompt: string) {
    generate({ mode: "chat", chatPrompt: prompt });
  }

  return (
    <section
      id="generator"
      className="w-full max-w-md mx-auto flex flex-col gap-2"
    >
      <header className="relative flex items-center justify-center">
        <h1 className="text-base sm:text-lg font-semibold text-ink text-center">
          AI Workout Generator
        </h1>
        {plan && (
          <button
            onClick={() => setPlan(null)}
            className="absolute right-0 text-xs text-ink-muted hover:text-ink underline-offset-4 hover:underline"
          >
            New plan
          </button>
        )}
      </header>

      <div className="rounded-xl border border-bg-border bg-white p-3 sm:p-4 shadow-card">
        <Tabs value={mode} onChange={setMode} />
        <div className="mt-4">
          {mode === "guided" ? (
            <GuidedForm loading={loading} onSubmit={handleGuided} />
          ) : (
            <ChatMode loading={loading} onSubmit={handleChat} />
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-black/20 bg-accent-soft text-xs text-ink px-3 py-2.5">
            {error}
          </div>
        )}
      </div>

      <div id="workout-output">
        {loading && <LoadingState />}
        {!loading && plan && (
          <div className="rounded-xl border border-bg-border bg-white p-3 sm:p-4 shadow-card">
            <WorkoutOutput
              plan={plan}
              onChange={setPlan}
              onReset={() => setPlan(null)}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-bg-border bg-white p-6 shadow-card text-center">
      <div className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulseDot" />
        <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulseDot [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulseDot [animation-delay:400ms]" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink">Designing your session…</p>
      <p className="mt-1 text-xs text-ink-muted">
        Balancing intensity, equipment, and any limitations.
      </p>
    </div>
  );
}
