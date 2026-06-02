import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SendPlanBody {
  email: string;
  profession: string;
  clientName: string;
  goal: string;
  pdfBase64: string;
  fileName: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: SendPlanBody;
  try {
    body = (await req.json()) as SendPlanBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!body.profession) {
    return NextResponse.json(
      { error: "Tell us if you're a fitness professional." },
      { status: 400 }
    );
  }
  if (!body.pdfBase64) {
    return NextResponse.json({ error: "Missing PDF data." }, { status: 400 });
  }

  // Lead capture — swap this for your CRM / marketing tool.
  // (Logged server-side so the lead isn't lost even if email delivery fails.)
  console.log(
    `[lead] ${body.email} · profession="${body.profession}" · client="${body.clientName}" · goal="${body.goal}"`
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email service not configured. Add RESEND_API_KEY to .env.local (get a free key at resend.com).",
      },
      { status: 500 }
    );
  }

  const from = process.env.EMAIL_FROM || "FitBudd <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: body.email,
      subject: `Your ${body.goal} workout plan${body.clientName ? ` for ${body.clientName}` : ""}`,
      html: buildEmailHtml(body),
      attachments: [
        {
          filename: body.fileName || "workout-plan.pdf",
          content: body.pdfBase64, // base64 string
        },
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: `Email failed: ${error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildEmailHtml(body: SendPlanBody): string {
  const signup = "https://www.fitbudd.com/your-brand-awaits-your-app-self-sign-up";
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b0b0f">
    <p style="font-size:20px;font-weight:700;margin:0 0 4px">Your workout plan is ready 💪</p>
    <p style="color:#4b5563;margin:0 0 16px">
      ${body.clientName ? `Here's the ${body.goal} plan for ${body.clientName}.` : `Here's your ${body.goal} plan.`}
      The full plan is attached as a PDF.
    </p>
    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;background:#f9fafb">
      <p style="font-weight:700;margin:0 0 6px">Launch your own branded fitness app</p>
      <p style="color:#4b5563;margin:0 0 14px">
        Deliver plans like this to your clients under your own brand, 4000+ exercises,
        custom workout builder, and client progress tracking.
      </p>
      <a href="${signup}" style="display:inline-block;background:#0b0b0f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">
        Start for free
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin-top:18px">
      Built with FitBudd · AI Workout Generator. This plan is general fitness guidance, not medical advice.
    </p>
  </div>`;
}
