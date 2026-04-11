"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBriefing(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const scope = formData.get("scope");
  const budget = formData.get("budget");
  const message = formData.get("message");

  try {
    await resend.emails.send({
      from: "Layer07 <onboarding@resend.dev>",
      to: "tu-email@dominio.com", // Tu correo de destino
      subject: `New Project Briefing: ${name}`,
      html: `
        <h1>New Lead Qualified</h1>
        <p><strong>Scope:</strong> ${scope}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Client:</strong> ${name} (${email})</p>
        <p><strong>Details:</strong> ${message}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
