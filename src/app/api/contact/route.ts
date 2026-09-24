import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/site";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  company: z.string().max(160).optional(),
  message: z.string().min(20).max(5000),
  locale: z.enum(["es", "en"]).optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { name, email, company, message, locale } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY missing — dry run", {
      name,
      email,
      company,
      locale,
    });

    // Locally a dry run is convenient; in production a missing key is a
    // misconfiguration, so fail loudly instead of faking a successful send.
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "Email service is not configured" },
        { status: 503 },
      );
    }

    return Response.json({
      ok: true,
      dryRun: true,
      message: "Received locally (set RESEND_API_KEY for real delivery).",
    });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "layer07 <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [SITE.email],
    replyTo: email,
    subject: `[layer07] New project enquiry — ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company ?? "—"}`,
      `Locale: ${locale ?? "—"}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }

  return Response.json({ ok: true });
}
