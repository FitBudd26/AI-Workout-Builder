"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { DownloadGateModal } from "./DownloadGateModal";
import { SignupPopup } from "./SignupPopup";
import { downloadWorkoutPdf, pdfFileName, workoutPdfBase64 } from "@/lib/pdf";
import type { WorkoutPlan } from "@/lib/types";

interface Props {
  plan: WorkoutPlan;
  onReset: () => void;
}

// Results view is a PREVIEW only — same size as the tool, no internal scroll.
// The full, detailed plan is delivered as a PDF when the user downloads.
export function WorkoutOutput({ plan, onReset }: Props) {
  const [gateOpen, setGateOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Email-gate flow: capture email → email the PDF → show signup popup.
  async function handleEmailSend(email: string, profession: string) {
    setSending(true);
    setServerError(null);
    try {
      const pdfBase64 = workoutPdfBase64(plan);
      const res = await fetch("/api/send-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession,
          clientName: plan.clientName,
          goal: plan.goal,
          pdfBase64,
          fileName: pdfFileName(plan),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't send the email.");
      // Also give them an immediate local copy, then upsell.
      downloadWorkoutPdf(plan);
      setGateOpen(false);
      setSignupOpen(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Couldn't send the email.");
    } finally {
      setSending(false);
    }
  }

  function handleDownloadAnyway() {
    downloadWorkoutPdf(plan);
    setGateOpen(false);
    setServerError(null);
    setSignupOpen(true);
  }

  const preview = plan.mainWorkout.slice(0, 3);
  const moreCount = Math.max(0, plan.mainWorkout.length - preview.length);

  return (
    <>
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-brand-teal font-semibold">
              Workout preview
            </p>
            <h2 className="text-sm font-bold text-ink mt-0.5 truncate">
              {plan.clientName || "Client"} · {plan.goal}
            </h2>
            <p className="text-[11px] text-ink-muted mt-0.5 truncate">
              {plan.duration} · {plan.trainingFormat}
            </p>
          </div>
          <button
            onClick={onReset}
            aria-label="Close"
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-bg-card hover:text-ink transition"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      {/* Compact preview — fits the tool footprint, no scroll */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {plan.goalSummary && (
          <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
            {plan.goalSummary}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Stat label="Warm-up" value={plan.warmup.length} />
          <Stat label="Exercises" value={plan.mainWorkout.length} />
          <Stat label="Cool-down" value={plan.cooldown.length} />
        </div>

        <ul className="flex flex-col gap-1.5">
          {preview.map((ex, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-bg-card px-3 py-2"
            >
              <span className="text-xs font-medium text-ink truncate">
                {i + 1}. {ex.exercise}
              </span>
              <span className="text-[11px] text-ink-muted shrink-0 whitespace-nowrap">
                {ex.sets} × {ex.reps}
              </span>
            </li>
          ))}
        </ul>

        {moreCount > 0 && (
          <p className="text-[11px] text-ink-dim text-center leading-relaxed">
            + {moreCount} more exercise{moreCount > 1 ? "s" : ""}, plus warm-up,
            cool-down, progression &amp; trainer notes in your PDF.
          </p>
        )}

        {/* Primary action anchored to the bottom of the card */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              setServerError(null);
              setGateOpen(true);
            }}
          >
            <DownloadIcon /> Download full plan (PDF)
          </Button>
          <button
            onClick={onReset}
            className="text-[11px] text-ink-dim hover:text-ink underline-offset-4 hover:underline"
          >
            ← Build another workout
          </button>
        </div>
      </div>

      <DownloadGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onSubmit={handleEmailSend}
        sending={sending}
        serverError={serverError}
        onDownloadAnyway={handleDownloadAnyway}
      />
      <SignupPopup open={signupOpen} onClose={() => setSignupOpen(false)} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full border border-brand-teal/20 bg-brand-tint px-2.5 py-1">
      <span className="text-xs font-bold text-brand-teal">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-ink-muted">
        {label}
      </span>
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
