# FitBudd · AI Workout Generator

A production-ready Next.js tool that lets personal trainers, gym owners, online
coaches, studios, and creators generate personalized, client-ready workout
plans in under a minute — using either a structured Guided form or natural
language Chat mode.

> Built to slot into the FitBudd brand: dark theme, red accent, mobile-first,
> branded PDF export, and a "Send through FitBudd app" CTA placeholder.

---

## Features

- **Guided Mode** — structured form (client, goal, location, intensity, type,
  duration, age, target areas, injuries, notes) with input validation.
- **Chat Mode** — free-text input (e.g. *"45-minute fat loss workout for a
  35-year-old beginner at home with knee pain and only dumbbells"*).
- **Structured AI output** — strict JSON schema parsed and rendered into an
  editable plan (warm-up, main workout, cool-down, progression, weekly split,
  trainer notes, safety disclaimer).
- **Editable output** — every field can be edited inline before exporting.
- **Branded PDF export** — single-click client-side download via `jspdf`.
- **Copy plan** — formatted plain-text copy.
- **CTA placeholders** — *Start Free*, *See Pricing*, *Send through FitBudd app*.
- **Provider-agnostic AI** — Anthropic Claude or OpenAI GPT via the same
  abstraction; auto-selects whichever key is present.
- **Coach-grade prompt** — injury-aware, equipment-aware, no medical advice,
  with explicit modifications per exercise.

---

## Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS** for styling
- **jsPDF** for client-side branded PDF export
- **@anthropic-ai/sdk** + **openai** SDKs behind a shared abstraction

---

## File structure

```
.
├── app/
│   ├── api/generate-workout/route.ts   # AI generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                        # Hero + Generator + Marketing
├── components/
│   ├── ui/                             # Button, Input, Select, Textarea, Field, Chip
│   ├── ChatMode.tsx
│   ├── Generator.tsx                   # Tabs + loading + result orchestration
│   ├── GuidedForm.tsx
│   ├── Hero.tsx
│   ├── MarketingSections.tsx           # How it works, modes compare, formats, etc.
│   ├── Tabs.tsx
│   └── WorkoutOutput.tsx               # Editable plan + export buttons
├── lib/
│   ├── ai.ts                           # Provider-agnostic AI client
│   ├── cn.ts
│   ├── parseWorkout.ts                 # Robust JSON extraction
│   ├── pdf.ts                          # Branded jsPDF export
│   ├── prompts.ts                      # System + user prompt builders
│   ├── sample.ts                       # Sample inputs + plan
│   └── types.ts                        # Domain types and schema
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure your AI provider
cp .env.example .env.local
# then edit .env.local and add ONE of:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

### Production

```bash
npm run build
npm start
```

### Type check

```bash
npm run typecheck
```

---

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | one of these is required | — | Use Claude as the AI provider |
| `OPENAI_API_KEY` | one of these is required | — | Use OpenAI as the AI provider |
| `AI_PROVIDER` | optional | auto | Force `anthropic` or `openai` |
| `ANTHROPIC_MODEL` | optional | `claude-opus-4-7` | Claude model id |
| `OPENAI_MODEL` | optional | `gpt-4o` | OpenAI model id |

If both keys are present, set `AI_PROVIDER` to choose. If neither is set,
`/api/generate-workout` returns a clear error.

> **Where to plug in your API key:** open `.env.local` in the project root and
> set either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`. The AI abstraction lives
> at `lib/ai.ts` — swap models or providers there.

---

## How the AI is prompted

The system prompt (`lib/prompts.ts`) instructs the model to behave like an
expert personal trainer and:

- Prioritize safety; never diagnose.
- Respect injuries with explicit modifications.
- Match difficulty to age, intensity, and stated experience.
- Respect duration and available equipment.
- Return ONLY a strict JSON object matching the schema in `lib/types.ts`.

The API route validates inputs, calls the provider via `lib/ai.ts`, parses the
JSON via `lib/parseWorkout.ts`, and returns `{ plan, provider }`.

---

## JSON schema returned

```ts
{
  clientName: string;
  goal: string;
  duration: string;
  trainingFormat: string;
  goalSummary: string;
  warmup: { movement: string; duration: string; notes?: string }[];
  mainWorkout: {
    exercise: string;
    sets: string;
    reps: string;
    rest: string;
    tempo?: string;
    notes: string;
    modification?: string;
  }[];
  cooldown: { movement: string; duration: string; notes?: string }[];
  progression: string;
  weeklySplitRecommendation: string;
  trainerNotes: string;
  disclaimer: string;
}
```

---

## Notes for the FitBudd team

- The **"Send through FitBudd app"** button is a CTA placeholder — wire it to
  your workspace API in `components/WorkoutOutput.tsx`.
- The **"Start Free"** and **"See Pricing"** CTAs anchor to `#generator` and
  `#pricing` respectively; point them at your real funnel.
- PDF branding lives in `lib/pdf.ts` — swap colors, footer copy, or add a
  logo via `doc.addImage` from a base64 string.
- All copy is in `components/MarketingSections.tsx` and `components/Hero.tsx`
  for easy editing.

---

## Safety

The generated plan always includes a safety disclaimer and the system prompt
explicitly avoids medical advice or diagnosis. Coaches should still review
every plan before sending to clients.
