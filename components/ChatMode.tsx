"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

const EXAMPLES = [
  "45-min fat loss workout for a 35-year-old beginner at home with knee pain and only dumbbells.",
  "60-min hypertrophy upper-body session for a 28-year-old intermediate at a commercial gym.",
  "20-min Tabata conditioning for a 40-year-old at a hotel with no equipment.",
];

interface Props {
  loading: boolean;
  onSubmit: (prompt: string) => void;
}

export function ChatMode({ loading, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("Describe the client in at least a sentence.");
      return;
    }
    setError(null);
    onSubmit(text.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div>
        <label className="text-xs font-semibold text-ink">Describe your client</label>
        <p className="text-[11px] text-ink-dim mt-0.5">
          Goal, age, equipment, duration, and anything to work around.
        </p>
      </div>

      <Textarea
        rows={4}
        placeholder='e.g. "45-min fat loss for a 35-year-old at home with knee pain and dumbbells."'
        value={text}
        onChange={(e) => setText(e.target.value)}
        invalid={!!error}
      />
      {error && <p className="text-[11px] text-brand-orange -mt-2">{error}</p>}

      <div>
        <p className="text-[10px] uppercase tracking-wide text-ink-dim mb-1.5">
          Examples
        </p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setText(ex);
                setError(null);
              }}
              className="text-left text-xs text-ink-muted hover:text-ink bg-bg-card border border-bg-border hover:border-brand-teal/40 rounded-lg px-3 py-2 transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
          Generate Workout
        </Button>
      </div>
    </form>
  );
}
