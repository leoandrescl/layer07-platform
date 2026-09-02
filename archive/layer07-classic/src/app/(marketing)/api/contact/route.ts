import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/site";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  company: z.string().max(160).optional(),
  message: z.string().min(20).max(5000),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { name, email, company, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY missing — dry run", {
      name,
      email,
      company,
    });
    return Response.json({
      ok: true,
      dryRun: true,
      message: "Recibido en modo local (configura RESEND_API_KEY para envío real).",
    });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "layer07 <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [SITE.email],
    replyTo: email,
    subject: `[layer07] Nueva transmisión — ${name}`,
    text: [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Empresa: ${company ?? "—"}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }

  return Response.json({ ok: true });
}
