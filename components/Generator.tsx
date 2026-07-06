"use client";

import { useEffect, useState } from "react";
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

  const overlayOpen = loading || !!plan;

  // Close the results overlay on Escape (not while generating).
  useEffect(() => {
    if (!plan) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlan(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [plan]);

  return (
    <section
      id="generator"
      className="w-full max-w-[536px] mx-auto p-4 flex flex-col gap-2.5"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-h-[440px]">
        <header className="relative flex items-center justify-center mb-3">
          <h1 className="text-sm font-bold text-brand-orange text-center whitespace-nowrap">
            AI Workout Generator
          </h1>
        </header>

        <Tabs value={mode} onChange={setMode} />
        <div className="mt-4">
          {mode === "guided" ? (
            <GuidedForm loading={loading} onSubmit={handleGuided} />
          ) : (
            <ChatMode loading={loading} onSubmit={handleChat} />
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-brand-orange/30 bg-brand-tint text-xs text-ink px-3 py-2.5">
            {error}
          </div>
        )}
      </div>

      {/* Results open as a new "page" on top of the tool, at the same 536px size. */}
      {overlayOpen && (
        <div className="fixed inset-0 z-40 flex justify-center overflow-y-auto bg-black/20 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="m-auto flex w-full max-w-[536px] min-h-[440px] max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
            {loading ? (
              <LoadingState />
            ) : plan ? (
              <WorkoutOutput
                plan={plan}
                onChange={setPlan}
                onReset={() => setPlan(null)}
              />
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulseDot" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulseDot [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulseDot [animation-delay:400ms]" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink">Designing your session…</p>
      <p className="mt-1 text-xs text-ink-muted">
        Balancing intensity, equipment, and any limitations.
      </p>
    </div>
  );
}
