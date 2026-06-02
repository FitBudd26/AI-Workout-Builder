"use client";

import { Button } from "./ui/Button";

export function MarketingSections() {
  return (
    <div className="mt-24 sm:mt-32 space-y-24 sm:space-y-32 px-4 pb-24">
      <HowItWorks />
      <WhatTheAITakes />
      <ModesCompare />
      <Formats />
      <BuiltFor />
      <WhyFitBudd />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <p className="text-xs uppercase tracking-wider text-accent font-semibold">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-3 text-ink-muted">{subtitle}</p>}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Tell us about your client",
      body: "Use the guided form or just type a sentence describing the client.",
    },
    {
      n: "02",
      title: "AI builds a structured plan",
      body: "Goal, equipment, intensity, age, injuries: every input shapes the output.",
    },
    {
      n: "03",
      title: "Edit, export, deliver",
      body: "Tweak in place, copy, export to branded PDF, or send through your FitBudd app.",
    },
  ];
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="How it works"
        title="From client brief to ready-to-send plan in 30 seconds"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-bg-border bg-bg-card p-6 hover:border-accent/40 transition"
          >
            <div className="text-accent text-sm font-semibold">{s.n}</div>
            <h3 className="mt-2 text-lg font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhatTheAITakes() {
  const items = [
    "Goal: fat loss, hypertrophy, strength, mobility, sport-specific, more",
    "Location & equipment: gym, home, hotel, no equipment, limited gear",
    "Intensity & workout type: circuit, HIIT, Tabata, EMOM, AMRAP, strength",
    "Session duration: built to actually fit 15 to 90 minutes",
    "Age & target areas: programming scaled to who's training",
    "Injuries & limitations: programmed around with modifications",
    "Free-text trainer notes: preferences, training history, anything else",
  ];
  return (
    <section className="max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="What the AI takes into account"
        title="Programming variables, not a generic template"
        subtitle="Every plan visibly reflects the inputs you give it."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {items.map((it) => (
          <div
            key={it}
            className="flex items-start gap-3 rounded-xl border border-bg-border bg-bg-card p-4"
          >
            <CheckIcon />
            <span className="text-sm text-ink-muted">{it}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModesCompare() {
  return (
    <section className="max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Two ways to build"
        title="Guided Mode vs Chat Mode"
        subtitle="Pick what fits the moment. Both produce the same structured, editable plan."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-bg-border bg-bg-card p-6">
          <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" /> Guided Mode
          </h3>
          <p className="text-sm text-ink-muted mt-2">
            Structured dropdowns for goal, intensity, type, duration, target areas, and
            injuries. Perfect for trainers onboarding a new client or building a
            consistent template across a roster.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>· Every required variable captured</li>
            <li>· Validation prevents incomplete prompts</li>
            <li>· Repeatable, consistent output</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-bg-border bg-bg-card p-6">
          <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" /> Chat Mode
          </h3>
          <p className="text-sm text-ink-muted mt-2">
            Describe the client in a single sentence. The AI extracts the variables and
            builds a plan. Great for fast turnarounds between sessions.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>· Natural language input</li>
            <li>· Smart defaults when a variable is missing</li>
            <li>· Same structured, editable output</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Formats() {
  const formats = [
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
  return (
    <section className="max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Workout formats"
        title="Built for how coaches actually program"
      />
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {formats.map((f) => (
          <span
            key={f}
            className="px-4 py-2 rounded-full bg-bg-card border border-bg-border text-sm text-ink-muted hover:border-accent/50 hover:text-ink transition"
          >
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}

function BuiltFor() {
  const personas = [
    { title: "Personal trainers", body: "Save hours on programming and spend more time coaching." },
    { title: "Gym owners", body: "Equip every trainer in the gym with a consistent program engine." },
    { title: "Online coaches", body: "Scale custom programming without sacrificing quality." },
    { title: "Studios", body: "Standardize class-style sessions across instructors." },
    { title: "Fitness creators", body: "Deliver branded plans to your community on demand." },
  ];
  return (
    <section className="max-w-6xl mx-auto">
      <SectionHeader eyebrow="Who it's built for" title="Made for coaches who deliver real results" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-bg-border bg-bg-card p-6 hover:border-accent/40 transition"
          >
            <h3 className="text-base font-semibold text-ink">{p.title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyFitBudd() {
  const rows = [
    {
      label: "Programming logic",
      generic: "Generic LLM templates",
      fitbudd: "Coach-grade prompt tuned for safety, modifications, and progression",
    },
    {
      label: "Injury awareness",
      generic: "Often ignored or generic",
      fitbudd: "Explicit modifications per exercise when limitations are listed",
    },
    {
      label: "Output structure",
      generic: "Wall of text",
      fitbudd: "Structured, editable plan with sets, reps, rest, tempo, cues",
    },
    {
      label: "Delivery",
      generic: "Copy-paste into Notes",
      fitbudd: "Branded PDF + send through your FitBudd app",
    },
    {
      label: "Reusable across roster",
      generic: "Rewrite every prompt",
      fitbudd: "Guided form + chat: both produce the same structured plan",
    },
  ];
  return (
    <section className="max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Why FitBudd"
        title="Better than generic AI prompts or templates"
      />
      <div className="overflow-hidden rounded-2xl border border-bg-border bg-bg-card">
        <div className="grid grid-cols-3 px-5 py-3 text-xs uppercase tracking-wider text-ink-dim border-b border-bg-border">
          <div></div>
          <div>Generic AI / templates</div>
          <div className="text-accent">FitBudd</div>
        </div>
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-3 px-5 py-4 text-sm border-b border-bg-border last:border-0"
          >
            <div className="text-ink font-medium">{r.label}</div>
            <div className="text-ink-muted">{r.generic}</div>
            <div className="text-ink">{r.fitbudd}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
