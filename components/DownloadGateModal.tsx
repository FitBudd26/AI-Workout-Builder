"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  // Fired once the HubSpot form is successfully submitted (lead captured).
  onSubmitted: () => void;
}

// HubSpot form config (FitBudd portal).
const HS_SRC = "https://js.hsforms.net/forms/embed/v2.js";
const PORTAL_ID = "9058640";
const FORM_ID = "c50c2e53-ff2e-4d8c-82cd-fd0be0521aa8";
const REGION = "na1";
const TARGET_ID = "hs-workout-form";

declare global {
  interface Window {
    hbspt?: {
      forms: { create: (opts: Record<string, unknown>) => void };
    };
  }
}

// Load the HubSpot forms embed script once, resolve when hbspt is ready.
function loadHubSpot(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.hbspt) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${HS_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("HubSpot script failed to load"))
      );
      if (window.hbspt) resolve();
      return;
    }

    const s = document.createElement("script");
    s.src = HS_SRC;
    s.async = true;
    s.charset = "utf-8";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("HubSpot script failed to load"));
    document.body.appendChild(s);
  });
}

export function DownloadGateModal({ open, onClose, onSubmitted }: Props) {
  const createdRef = useRef(false);
  const [failed, setFailed] = useState(false);

  // Keep the latest onSubmitted without re-creating the form.
  const submittedRef = useRef(onSubmitted);
  useEffect(() => {
    submittedRef.current = onSubmitted;
  });

  useEffect(() => {
    if (!open) {
      createdRef.current = false;
      setFailed(false);
      return;
    }

    let cancelled = false;
    loadHubSpot()
      .then(() => {
        const target = document.getElementById(TARGET_ID);
        if (cancelled || createdRef.current || !window.hbspt || !target) return;
        target.innerHTML = "";
        createdRef.current = true;
        window.hbspt.forms.create({
          portalId: PORTAL_ID,
          formId: FORM_ID,
          region: REGION,
          target: `#${TARGET_ID}`,
          onFormSubmitted: () => submittedRef.current(),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

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

      <div id={TARGET_ID} className="mt-4 min-h-[120px]" />

      {failed && (
        <div className="mt-3 rounded-lg border border-brand-orange/30 bg-brand-tint text-[11px] text-ink px-3 py-2">
          Couldn&apos;t load the form. Please check your connection and try
          again.
        </div>
      )}
    </Modal>
  );
}
