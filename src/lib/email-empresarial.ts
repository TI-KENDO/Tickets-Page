/**
 * Validación de correos empresariales.
 * Compartido entre el formulario (navegador) y la Pages Function /api/contact.
 *
 * Rechaza correos de proveedores gratuitos/personales (Gmail, Hotmail, Outlook,
 * Yahoo, iCloud, etc.) incluyendo sus variantes regionales (.com.mx, .es, ...).
 */

export const EMAIL_EMPRESARIAL_ERROR =
  "Usa tu correo empresarial (no se aceptan Gmail, Hotmail, Outlook, Yahoo, etc.).";

export const EMAIL_INVALIDO_ERROR = "Ingresa un correo electrónico válido.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Marcas de correo gratuito; se bloquean con cualquier TLD (gmail.com, hotmail.com.mx, yahoo.es...). */
const MARCAS_GRATUITAS = [
  "gmail",
  "googlemail",
  "hotmail",
  "outlook",
  "live",
  "msn",
  "yahoo",
  "ymail",
  "rocketmail",
  "aol",
  "icloud",
  "me",
  "mac",
  "protonmail",
  "proton",
  "tutanota",
  "tutamail",
  "gmx",
  "yandex",
  "zoho",
  "mail",
  "inbox",
];

/** Dominios gratuitos que no siguen el patrón marca.tld. */
const DOMINIOS_GRATUITOS = new Set([
  "pm.me",
  "tuta.io",
  "prodigy.net.mx",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
]);

const MARCA_RE = new RegExp(`^(?:${MARCAS_GRATUITAS.join("|")})\\.[a-z]{2,6}(?:\\.[a-z]{2})?$`);

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** true si el correo es válido y no pertenece a un proveedor gratuito. */
export function isBusinessEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!EMAIL_RE.test(value)) return false;
  const domain = value.slice(value.lastIndexOf("@") + 1);
  return !DOMINIOS_GRATUITOS.has(domain) && !MARCA_RE.test(domain);
}
