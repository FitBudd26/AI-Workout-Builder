"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const PROFESSIONS = [
  "Personal Trainer",
  "Gym / Studio Owner",
  "Online Coach",
  "Fitness Creator",
  "Just for myself",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, profession: string) => Promise<void> | void;
  sending: boolean;
  serverError: string | null;
  onDownloadAnyway: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DownloadGateModal({
  open,
  onClose,
  onSubmit,
  sending,
  serverError,
  onDownloadAnyway,
}: Props) {
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!profession) {
      setError("Select an option.");
      return;
    }
    setError(null);
    onSubmit(email, profession);
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="download-gate-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="download-gate-title" className="text-lg font-bold text-ink">
          Get your workout plan
        </h2>
        <button
          onClick={onClose}
          className="text-ink-dim hover:text-ink text-xl leading-none -mt-1"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-ink-muted mt-1">
        Enter your email and we&apos;ll send the full plan as a PDF.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
        <Field label="Email" required htmlFor="gate-email">
          <Input
            id="gate-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error && !EMAIL_RE.test(email)}
            autoFocus
          />
        </Field>

        <Field label="Are you a fitness professional?" required>
          <Select
            placeholder="Select an option"
            value={profession}
            invalid={!!error && !profession}
            onChange={(e) => setProfession(e.target.value)}
            options={PROFESSIONS.map((p) => ({ value: p, label: p }))}
          />
        </Field>

        {error && <p className="text-[11px] text-black/80">{error}</p>}
        {serverError && (
          <div className="rounded-lg border border-black/20 bg-accent-soft text-[11px] text-ink px-3 py-2">
            {serverError}
            <button
              type="button"
              onClick={onDownloadAnyway}
              className="block mt-1 underline underline-offset-2 font-medium"
            >
              Download the PDF directly instead
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={sending} className="flex-1">
            Email me the PDF
          </Button>
        </div>
      </form>
    </Modal>
  );
}
