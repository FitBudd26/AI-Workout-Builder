"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { DownloadGateModal } from "./DownloadGateModal";
import { SignupPopup } from "./SignupPopup";
import { downloadWorkoutPdf, pdfFileName, workoutPdfBase64 } from "@/lib/pdf";
import type { Exercise, WarmupItem, WorkoutPlan } from "@/lib/types";

interface Props {
  plan: WorkoutPlan;
  onChange: (next: WorkoutPlan) => void;
  onReset: () => void;
}

export function WorkoutOutput({ plan, onChange, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const plainText = useMemo(() => planToText(plan), [plan]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

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

  function updateMain(idx: number, patch: Partial<Exercise>) {
    onChange({
      ...plan,
      mainWorkout: plan.mainWorkout.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    });
  }
  function updateWarmup(idx: number, patch: Partial<WarmupItem>) {
    onChange({
      ...plan,
      warmup: plan.warmup.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    });
  }
  function updateCooldown(idx: number, patch: Partial<WarmupItem>) {
    onChange({
      ...plan,
      cooldown: plan.cooldown.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    });
  }

  return (
    <>
      {/* Fixed header: stays put while the preview below scrolls. */}
      <header className="shrink-0 border-b border-gray-200 p-4 animate-fadeIn">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold">
              Your workout plan
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

        <div className="mt-3 flex gap-1.5">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => {
              setServerError(null);
              setGateOpen(true);
            }}
          >
            <DownloadIcon /> Download PDF
          </Button>
          <Button variant="secondary" size="md" onClick={copyAll}>
            <CopyIcon /> {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </header>

      {/* Workout preview — flows naturally so the embed auto-sizes to it */}
      <div className="p-4 flex flex-col gap-4 animate-fadeIn">
      {plan.goalSummary && (
        <div className="rounded-lg border border-brand-teal/20 bg-brand-tint p-3">
          <p className="text-xs text-ink-muted leading-relaxed">{plan.goalSummary}</p>
        </div>
      )}

      <Section title="Warm-up">
        <ul className="space-y-1.5">
          {plan.warmup.map((w, i) => (
            <li
              key={i}
              className="bg-bg-card border border-bg-border rounded-lg px-3 py-2"
            >
              <EditableText
                value={w.movement}
                onChange={(v) => updateWarmup(i, { movement: v })}
                className="text-sm font-medium text-ink"
              />
              <div className="flex gap-2 mt-0.5">
                <EditableText
                  value={w.duration}
                  onChange={(v) => updateWarmup(i, { duration: v })}
                  className="text-[11px] text-ink-muted w-20"
                />
                <EditableText
                  value={w.notes ?? ""}
                  placeholder="Notes"
                  onChange={(v) => updateWarmup(i, { notes: v })}
                  className="text-[11px] text-ink-dim flex-1"
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Main Workout">
        <div className="space-y-2">
          {plan.mainWorkout.map((ex, i) => (
            <article
              key={i}
              className="rounded-lg border border-bg-border bg-bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <EditableText
                  value={ex.exercise}
                  onChange={(v) => updateMain(i, { exercise: v })}
                  className="text-sm font-semibold text-ink"
                />
                <span className="text-[10px] text-ink-dim mt-0.5 shrink-0">#{i + 1}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <MiniField
                  label="Sets"
                  value={ex.sets}
                  onChange={(v) => updateMain(i, { sets: v })}
                />
                <MiniField
                  label="Reps"
                  value={ex.reps}
                  onChange={(v) => updateMain(i, { reps: v })}
                />
                <MiniField
                  label="Rest"
                  value={ex.rest}
                  onChange={(v) => updateMain(i, { rest: v })}
                />
                <MiniField
                  label="Tempo"
                  value={ex.tempo ?? ""}
                  onChange={(v) => updateMain(i, { tempo: v })}
                  placeholder="-"
                />
              </div>

              <div className="mt-2 space-y-1">
                <EditableLine
                  label="Cue"
                  value={ex.notes}
                  onChange={(v) => updateMain(i, { notes: v })}
                />
                <EditableLine
                  label="Mod"
                  bold
                  value={ex.modification ?? ""}
                  placeholder="Regression / progression"
                  onChange={(v) => updateMain(i, { modification: v })}
                />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Cool-down">
        <ul className="space-y-1.5">
          {plan.cooldown.map((c, i) => (
            <li
              key={i}
              className="bg-bg-card border border-bg-border rounded-lg px-3 py-2"
            >
              <EditableText
                value={c.movement}
                onChange={(v) => updateCooldown(i, { movement: v })}
                className="text-sm font-medium text-ink"
              />
              <div className="flex gap-2 mt-0.5">
                <EditableText
                  value={c.duration}
                  onChange={(v) => updateCooldown(i, { duration: v })}
                  className="text-[11px] text-ink-muted w-20"
                />
                <EditableText
                  value={c.notes ?? ""}
                  placeholder="Notes"
                  onChange={(v) => updateCooldown(i, { notes: v })}
                  className="text-[11px] text-ink-dim flex-1"
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid grid-cols-1 gap-2">
        <InfoCard title="Progressive overload">
          <EditableText
            value={plan.progression}
            onChange={(v) => onChange({ ...plan, progression: v })}
            className="text-xs text-ink-muted leading-relaxed"
            multiline
          />
        </InfoCard>
        <InfoCard title="Weekly split">
          <EditableText
            value={plan.weeklySplitRecommendation}
            onChange={(v) => onChange({ ...plan, weeklySplitRecommendation: v })}
            className="text-xs text-ink-muted leading-relaxed"
            multiline
          />
        </InfoCard>
        <InfoCard title="Trainer notes">
          <EditableText
            value={plan.trainerNotes}
            onChange={(v) => onChange({ ...plan, trainerNotes: v })}
            className="text-xs text-ink-muted leading-relaxed"
            multiline
          />
        </InfoCard>
        <InfoCard title="Safety">
          <EditableText
            value={plan.disclaimer}
            onChange={(v) => onChange({ ...plan, disclaimer: v })}
            className="text-xs text-ink-dim leading-relaxed"
            multiline
          />
        </InfoCard>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-teal/20 bg-brand-tint p-3">
      <h4 className="text-[10px] uppercase tracking-wider text-brand-teal font-semibold mb-1">
        {title}
      </h4>
      {children}
    </div>
  );
}

function MiniField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-md bg-white border border-bg-border px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-ink-dim">{label}</p>
      <EditableText
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-xs text-ink font-medium"
      />
    </div>
  );
}

function EditableLine({
  label,
  value,
  onChange,
  placeholder,
  bold,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={
          "text-[9px] uppercase tracking-wider font-semibold w-8 shrink-0 " +
          (bold ? "text-ink" : "text-ink-dim")
        }
      >
        {label}
      </span>
      <EditableText
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-xs text-ink-muted leading-relaxed flex-1"
        multiline
      />
    </div>
  );
}

interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

function EditableText({ value, onChange, className, placeholder, multiline }: EditableTextProps) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={Math.max(1, Math.min(6, value.split("\n").length))}
        className={
          "bg-transparent border-0 focus:outline-none focus:ring-0 w-full resize-none placeholder:text-ink-dim p-0 " +
          (className ?? "")
        }
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        "bg-transparent border-0 focus:outline-none focus:ring-0 w-full placeholder:text-ink-dim p-0 " +
        (className ?? "")
      }
    />
  );
}

function planToText(plan: WorkoutPlan): string {
  const lines: string[] = [];
  lines.push(`Workout Plan: ${plan.clientName}`);
  lines.push(`Goal: ${plan.goal}`);
  lines.push(`Duration: ${plan.duration}`);
  lines.push(`Format: ${plan.trainingFormat}`);
  if (plan.goalSummary) lines.push("", plan.goalSummary);

  lines.push("", "WARM-UP");
  plan.warmup.forEach((w) =>
    lines.push(`• ${w.movement}: ${w.duration}${w.notes ? ` (${w.notes})` : ""}`)
  );

  lines.push("", "MAIN WORKOUT");
  plan.mainWorkout.forEach((e, i) => {
    lines.push(`${i + 1}. ${e.exercise}`);
    const meta = [`Sets ${e.sets}`, `Reps ${e.reps}`, `Rest ${e.rest}`];
    if (e.tempo) meta.push(`Tempo ${e.tempo}`);
    lines.push(`   ${meta.join(" · ")}`);
    if (e.notes) lines.push(`   Cue: ${e.notes}`);
    if (e.modification) lines.push(`   Mod: ${e.modification}`);
  });

  lines.push("", "COOL-DOWN");
  plan.cooldown.forEach((w) =>
    lines.push(`• ${w.movement}: ${w.duration}${w.notes ? ` (${w.notes})` : ""}`)
  );

  if (plan.progression) lines.push("", "Progression:", plan.progression);
  if (plan.weeklySplitRecommendation)
    lines.push("", "Weekly Split:", plan.weeklySplitRecommendation);
  if (plan.trainerNotes) lines.push("", "Trainer Notes:", plan.trainerNotes);
  if (plan.disclaimer) lines.push("", "Safety:", plan.disclaimer);

  return lines.join("\n");
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
