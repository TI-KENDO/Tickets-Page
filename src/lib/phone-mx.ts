/**
 * Validación de teléfonos de México (plan de numeración de 10 dígitos).
 * Compartido entre el formulario (navegador) y la Pages Function /api/contact.
 *
 * Acepta, ignorando espacios, guiones, puntos y paréntesis:
 *   5513287995 · (55) 1328-7995 · +52 55 1328 7995 · 52 5513287995
 *   +52 1 55 1328 7995 (prefijo "1" de celular, ya en desuso)
 */

export const PHONE_MX_ERROR =
  "Ingresa un teléfono de México de 10 dígitos, por ejemplo (55) 1328-7995.";

/** Devuelve los 10 dígitos nacionales, o null si el número no es válido. */
export function normalizePhoneMX(input: string): string | null {
  const raw = input.trim();
  if (!/^\+?[\d\s().-]+$/.test(raw)) return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);

  // Las ladas en México nunca empiezan con 0 ni 1.
  return /^[2-9]\d{9}$/.test(digits) ? digits : null;
}

/** Formato para mostrar/enviar: +52 5513287995 */
export function formatPhoneMX(national: string): string {
  return `+52 ${national}`;
}
