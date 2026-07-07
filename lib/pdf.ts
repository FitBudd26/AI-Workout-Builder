import { jsPDF } from "jspdf";
import type { WorkoutPlan } from "./types";

// Branded PDF export modeled on the FitBudd example layout:
// logo header → title → "Professional Workout Plan" subtitle → summary card →
// sections (warm-up / main / cool-down / progression / etc.) → CTA footer.

const ORANGE: [number, number, number] = [244, 94, 38]; // FitBudd flame
const BLACK: [number, number, number] = [11, 11, 15];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [229, 231, 235];
const CARD: [number, number, number] = [249, 250, 251];

const SELF_SIGNUP_URL =
  "https://www.fitbudd.com/your-brand-awaits-your-app-self-sign-up";

// Builds the document (shared by both browser download and server emailing).
export function buildWorkoutDoc(plan: WorkoutPlan): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 52;

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - 60) {
      doc.addPage();
      cursorY = 52;
    }
  };

  // ---- Logo ----
  drawLogo(doc, marginX, cursorY);
  cursorY += 44;

  // ---- Title ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BLACK);
  // No placeholder name in a client-facing doc — fall back to a goal title.
  const title = plan.clientName
    ? `${plan.clientName}'s ${plan.goal} Workout`
    : `${plan.goal} Workout Plan`;
  doc.text(title, marginX, cursorY);
  cursorY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`Professional Workout Plan  •  ${plan.duration}`, marginX, cursorY);
  cursorY += 22;

  // ---- Summary card (short values only, so nothing clips) ----
  const cardH = 64;
  doc.setDrawColor(...LINE);
  doc.setFillColor(...CARD);
  doc.roundedRect(marginX, cursorY, contentWidth, cardH, 8, 8, "FD");
  const col = contentWidth / 3;
  summaryCell(doc, "GOAL", plan.goal, marginX + 16, cursorY + 24);
  summaryCell(doc, "DURATION", plan.duration, marginX + col + 8, cursorY + 24);
  summaryCell(
    doc,
    "EXERCISES",
    String(plan.mainWorkout.length),
    marginX + col * 2,
    cursorY + 24
  );
  cursorY += cardH + 20;

  // ---- Format (full, wrapped — no longer crammed into a tiny cell) ----
  if (plan.trainingFormat) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("FORMAT", marginX, cursorY);
    cursorY += 13;
    cursorY = paragraph(doc, plan.trainingFormat, marginX, cursorY, contentWidth, INK);
    cursorY += 12;
  }

  if (plan.goalSummary) {
    cursorY = paragraph(doc, plan.goalSummary, marginX, cursorY, contentWidth, MUTED);
    cursorY += 12;
  }

  // ---- Warm-up ----
  cursorY = sectionTitle(doc, "Warm-up", marginX, cursorY, ensureSpace);
  plan.warmup.forEach((w) => {
    cursorY = bulletItem(doc, w.movement, w.duration, w.notes, marginX, cursorY, contentWidth, ensureSpace);
  });
  cursorY += 4;

  // ---- Exercises (main workout, as cards) ----
  cursorY = sectionTitle(doc, "Exercises", marginX, cursorY, ensureSpace);
  plan.mainWorkout.forEach((ex, i) => {
    // measure card height
    const cueLines = ex.notes ? doc.splitTextToSize(`Cue: ${ex.notes}`, contentWidth - 28) : [];
    const modLines = ex.modification
      ? doc.splitTextToSize(`Modification: ${ex.modification}`, contentWidth - 28)
      : [];
    const bodyH = 30 + (cueLines.length + modLines.length) * 12;
    const boxH = Math.max(48, bodyH);
    ensureSpace(boxH + 10);

    doc.setDrawColor(...LINE);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, cursorY, contentWidth, boxH, 8, 8, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(`${i + 1}. ${ex.exercise}`, marginX + 14, cursorY + 20);

    // meta right-aligned. Only append "sets"/"reps" when the value is a bare
    // number — so time/round formats ("3 rounds", "40s work") don't collide
    // into "3 rounds sets • 40s work reps".
    const meta = [fmtCount(ex.sets, "sets"), fmtCount(ex.reps, "reps"), `Rest ${ex.rest}`];
    if (ex.tempo) meta.push(`Tempo ${ex.tempo}`);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...ORANGE);
    doc.text(meta.filter(Boolean).join("  •  "), marginX + contentWidth - 14, cursorY + 20, {
      align: "right",
    });

    let innerY = cursorY + 36;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (cueLines.length) {
      doc.setTextColor(...MUTED);
      doc.text(cueLines, marginX + 14, innerY);
      innerY += cueLines.length * 12;
    }
    if (modLines.length) {
      doc.setTextColor(...ORANGE);
      doc.text(modLines, marginX + 14, innerY);
    }

    cursorY += boxH + 10;
  });
  cursorY += 2;

  // ---- Cool-down ----
  cursorY = sectionTitle(doc, "Cool-down", marginX, cursorY, ensureSpace);
  plan.cooldown.forEach((c) => {
    cursorY = bulletItem(doc, c.movement, c.duration, c.notes, marginX, cursorY, contentWidth, ensureSpace);
  });
  cursorY += 6;

  // ---- Info sections ----
  const infoSections: [string, string][] = [
    ["Progressive Overload", plan.progression],
    ["Weekly Split", plan.weeklySplitRecommendation],
    ["Trainer Notes", plan.trainerNotes],
    ["Safety", plan.disclaimer],
  ];
  infoSections.forEach(([label, value]) => {
    if (!value) return;
    cursorY = sectionTitle(doc, label, marginX, cursorY, ensureSpace);
    cursorY = paragraph(
      doc,
      value,
      marginX,
      cursorY,
      contentWidth,
      label === "Safety" ? MUTED : INK
    );
    cursorY += 8;
  });

  // ---- CTA footer ----
  drawCtaFooter(doc, marginX, contentWidth, ensureSpace, () => cursorY, (y) => (cursorY = y));

  // ---- Page footers ----
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Built with FitBudd · AI Workout Generator", marginX, pageHeight - 28);
    doc.text(`Page ${p} / ${pageCount}`, pageWidth - marginX, pageHeight - 28, {
      align: "right",
    });
  }

  return doc;
}

// Browser: trigger a download.
export function downloadWorkoutPdf(plan: WorkoutPlan) {
  const doc = buildWorkoutDoc(plan);
  doc.save(pdfFileName(plan));
}

// For emailing: base64 (no data-URI prefix), suitable as an attachment.
export function workoutPdfBase64(plan: WorkoutPlan): string {
  const doc = buildWorkoutDoc(plan);
  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1] ?? "";
}

export function pdfFileName(plan: WorkoutPlan): string {
  const safeName = (plan.clientName || "client")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .toLowerCase();
  return `${safeName}-workout.pdf`;
}

// A warm-up / cool-down bullet whose detail line WRAPS instead of running off
// the right page edge (the cause of the "…across the " mid-sentence clipping).
function bulletItem(
  doc: jsPDF,
  movement: string,
  duration: string,
  notes: string | undefined,
  marginX: number,
  y: number,
  contentWidth: number,
  ensureSpace: (n: number) => void
): number {
  const detail = `${duration}${notes ? " — " + notes : ""}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(detail, contentWidth - 14);
  const h = 15 + lines.length * 12;
  ensureSpace(h);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`• ${movement}`, marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(lines, marginX + 14, y + 13);

  return y + h;
}

// Append a unit label only to bare numbers ("3" → "3 sets"); leave descriptive
// values untouched ("3 rounds" → "3 rounds", "40s work" → "40s work").
function fmtCount(value: string, unit: string): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  return /^\d+$/.test(v) ? `${v} ${unit}` : v;
}

// ---------- drawing helpers ----------

function drawLogo(doc: jsPDF, x: number, y: number) {
  // Flame mark (teardrop): circle base + triangle tip.
  doc.setFillColor(...ORANGE);
  doc.circle(x + 7, y + 9, 6.5, "F");
  doc.triangle(x + 1.5, y + 9, x + 7, y - 5, x + 12.5, y + 9, "F");
  // small inner highlight
  doc.setFillColor(255, 255, 255);
  doc.circle(x + 8.5, y + 10, 2, "F");

  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text("fit", x + 22, y + 13);
  const fitW = doc.getTextWidth("fit");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("budd", x + 22 + fitW, y + 13);
}

function summaryCell(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  const truncated = value.length > 26 ? value.slice(0, 25) + "…" : value;
  doc.text(truncated, x, y + 16);
}

function sectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  ensureSpace: (n: number) => void
): number {
  ensureSpace(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BLACK);
  doc.text(title, x, y);
  return y + 20;
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  color: [number, number, number]
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * 14;
}

function drawCtaFooter(
  doc: jsPDF,
  marginX: number,
  contentWidth: number,
  ensureSpace: (n: number) => void,
  getY: () => number,
  setY: (y: number) => void
) {
  ensureSpace(120);
  let y = getY() + 12;

  // divider
  doc.setDrawColor(...LINE);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BLACK);
  doc.text("Launch your branded fitness app in minutes", marginX + contentWidth / 2, y, {
    align: "center",
  });
  y += 18;

  // button
  const btnW = 200;
  const btnH = 36;
  const btnX = marginX + (contentWidth - btnW) / 2;
  doc.setFillColor(...BLACK);
  doc.roundedRect(btnX, y, btnW, btnH, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("Start for FREE", marginX + contentWidth / 2, y + 23, { align: "center" });
  doc.link(btnX, y, btnW, btnH, { url: SELF_SIGNUP_URL });
  y += btnH + 8;

  setY(y);
}
