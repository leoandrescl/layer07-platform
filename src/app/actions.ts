"use server";
import { Resend } from "resend";

export async function sendBriefing(formData: FormData): Promise<{ success: boolean; error?: unknown }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Simulating a successful response.");
      return { success: true };
    }
    const resend = new Resend(resendApiKey);

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const scope = formData.get("scope")?.toString();
    const budget = formData.get("budget")?.toString();
    const message = formData.get("message")?.toString();

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
    return { success: false, error: String(error) };
  }
}
