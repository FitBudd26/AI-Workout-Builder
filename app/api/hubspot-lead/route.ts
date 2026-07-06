import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// FitBudd HubSpot form (email capture). The Forms Submission API needs no
// auth token and triggers whatever notifications / workflows the form has.
const PORTAL_ID = "9058640";
const FORM_ID = "c50c2e53-ff2e-4d8c-82cd-fd0be0521aa8";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadBody {
  email: string;
  firstName?: string;
  consent?: boolean;
  pageUri?: string;
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const fields: { name: string; value: string }[] = [
    { name: "email", value: body.email },
  ];
  if (body.firstName?.trim()) {
    fields.push({ name: "firstname", value: body.firstName.trim() });
  }

  const payload = {
    fields,
    context: {
      pageUri: body.pageUri || "https://ai-workout-builder-ten.vercel.app/",
      pageName: "AI Workout Generator",
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "I agree to allow FitBudd to store and process my personal data.",
      },
    },
  };

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // Log server-side so the lead isn't silently lost, then surface a
      // generic error (the client still lets the user download the PDF).
      console.error(`[hubspot-lead] submit failed (${res.status}): ${detail}`);
      return NextResponse.json(
        { error: "Couldn't save your details. You can still download the plan." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit lead.";
    console.error(`[hubspot-lead] ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
