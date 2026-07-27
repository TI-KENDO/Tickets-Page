interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

interface ContactPayload {
  fname?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Cuerpo inválido." }, 400);
  }

  const fname = (data.fname ?? "").trim();
  const email = (data.email ?? "").trim();
  const phone = (data.phone ?? "").trim();
  const subject = (data.subject ?? "").trim();
  const message = (data.message ?? "").trim();

  if (!fname || !email || !message) {
    return jsonResponse({ ok: false, error: "Nombre, correo y mensaje son obligatorios." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "Correo electrónico inválido." }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ ok: false, error: "El servicio de correo no está configurado." }, 500);
  }

  const to = env.CONTACT_TO_EMAIL || "soporte@tikendo.com.mx";
  const from = env.CONTACT_FROM_EMAIL || "Kendesk <formulario@tikendo.com.mx>";

  const text = [
    `Nombre: ${fname}`,
    `Correo: ${email}`,
    phone && `Teléfono: ${phone}`,
    subject && `Asunto: ${subject}`,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: subject ? `Contacto web: ${subject}` : `Nuevo mensaje de contacto de ${fname}`,
      text,
    }),
  });

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    console.error("Resend error:", resendResponse.status, errorBody);
    return jsonResponse({ ok: false, error: "No se pudo enviar el mensaje. Intenta de nuevo más tarde." }, 502);
  }

  return jsonResponse({ ok: true }, 200);
};
