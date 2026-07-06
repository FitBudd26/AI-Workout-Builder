"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

interface Props {
  open: boolean;
  onClose: () => void;
  // Called once we should hand over the plan (after capture, or "download anyway").
  onProceed: () => void;
}

// Matches the HubSpot dropdown "are_you_a_fitness_professional" options.
const PROFESSIONS = [
  "Fitness Coach",
  "Personal Trainer",
  "Just for Myself",
  "Influencer/Creator",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DownloadGateModal({ open, onClose, onProceed }: Props) {
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!profession) {
      setError("Select an option.");
      return;
    }
    if (!consent) {
      setError("Please tick the box to continue.");
      return;
    }
    setError(null);
    setServerError(null);
    setSending(true);
    try {
      const res = await fetch("/api/hubspot-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession,
          consent,
          pageUri: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save your details.");
      onProceed();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Couldn't save your details."
      );
    } finally {
      setSending(false);
    }
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
        Enter your email and your full plan downloads as a PDF.
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

        <label className="flex items-start gap-2 text-[11px] text-ink-muted leading-relaxed">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-brand-teal"
          />
          <span>I agree to receive communications from FitBudd and allow FitBudd to store my details. You can unsubscribe anytime.</span>
        </label>

        {error && <p className="text-[11px] text-brand-orange">{error}</p>}
        {serverError && (
          <div className="rounded-lg border border-brand-orange/30 bg-brand-tint text-[11px] text-ink px-3 py-2">
            {serverError}
            <button
              type="button"
              onClick={onProceed}
              className="block mt-1 underline underline-offset-2 font-medium"
            >
              Download the PDF anyway
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={sending} className="flex-1">
            Download plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
