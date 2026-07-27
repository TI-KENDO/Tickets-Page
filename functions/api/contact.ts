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

async function parseBody(request: Request): Promise<ContactPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as ContactPayload;
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as unknown as ContactPayload;
  }

  throw new Error(`Content-Type no soportado: ${contentType}`);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    let data: ContactPayload;
    try {
      data = await parseBody(request);
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

    const apiKey = (env.RESEND_API_KEY ?? "").trim();
    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada.");
      return jsonResponse({ ok: false, error: "El servicio de correo no está configurado." }, 500);
    }

    const to = env.CONTACT_TO_EMAIL || "soporte@tikendo.com.mx";
    const from = env.CONTACT_FROM_EMAIL || "Kendesk <formulario@kendesk.tikendo.com.mx>";

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

    let resendResponse: Response;
    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
    } catch (err) {
      console.error("Fallo al llamar a Resend:", err instanceof Error ? err.message : err);
      return jsonResponse({ ok: false, error: "No se pudo contactar al servicio de correo." }, 500);
    }

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend error:", resendResponse.status, errorBody);
      return jsonResponse({ ok: false, error: "No se pudo enviar el mensaje. Intenta de nuevo más tarde." }, 500);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("Error inesperado en /api/contact:", err instanceof Error ? err.message : err);
    return jsonResponse({ ok: false, error: "Error inesperado. Intenta de nuevo más tarde." }, 500);
  }
};
