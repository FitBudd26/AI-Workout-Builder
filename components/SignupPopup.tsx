"use client";

import { Modal } from "./Modal";
import { Button } from "./ui/Button";

const SELF_SIGNUP_URL =
  "https://www.fitbudd.com/your-brand-awaits-your-app-self-sign-up?utm_source=workout-generator&utm_medium=web&utm_campaign=ai-workout-builder&utm_content=post-generation-popup";

const BENEFITS = [
  "Access to 4000+ interactive exercises",
  "Custom workout builder",
  "Client progress tracking",
  "Your own branded app",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SignupPopup({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="signup-title">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.39 5.62L20 9.27l-4.5 3.84L16.9 19 12 16.27 7.1 19l1.4-5.89L4 9.27l5.61-1.65L12 2z" />
          </svg>
        </div>
        <h2 id="signup-title" className="mt-4 text-xl font-bold text-ink">
          There&apos;s a better way to train clients
        </h2>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          Launch your branded fitness app
        </p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-3 text-sm text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <a href={SELF_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="block mt-6">
        <Button className="w-full" size="lg">
          Start for free
        </Button>
      </a>
      <button
        onClick={onClose}
        className="block mx-auto mt-3 text-sm text-ink-muted hover:text-ink"
      >
        Maybe later
      </button>
    </Modal>
  );
}
