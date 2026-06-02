"use client";

import { Button } from "./ui/Button";

export function Hero() {
  return (
    <header className="text-center max-w-3xl mx-auto pt-14 sm:pt-20 pb-8 sm:pb-12 px-4">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-bg-card border border-bg-border text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulseDot" />
        FitBudd · AI Workout Generator
      </span>
      <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink">
        Build client-ready workouts <br className="hidden sm:block" />
        in <span className="text-accent">under a minute</span>.
      </h1>
      <p className="mt-5 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
        Personalized, safe, programming-grade plans for personal trainers, gym owners,
        online coaches, studios, and creators. Generate, edit, export, and deliver, all
        in one place.
      </p>
      <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="#generator">
          <Button size="lg">Start Free</Button>
        </a>
      </div>
      <p className="mt-3 text-xs text-ink-dim">
        No credit card required · Edit, brand, and send through your FitBudd app
      </p>
    </header>
  );
}
