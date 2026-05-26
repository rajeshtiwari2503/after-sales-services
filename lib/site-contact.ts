/** Public contact details for marketing / landing (override via env). */
const digits = (
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "919876543210"
).replace(/\D/g, "");

export const SITE_PHONE_DIGITS = digits.startsWith("91")
  ? digits
  : digits.length === 10
    ? `91${digits}`
    : digits;

export const SITE_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY ?? "+91 98765 43210";

export const SITE_PHONE_TEL = `tel:+${SITE_PHONE_DIGITS}`;

export const SITE_WHATSAPP_URL = `https://wa.me/${SITE_PHONE_DIGITS}?text=${encodeURIComponent(
  "Hi SaaS Techify, I'd like to know more about your after-sales platform."
)}`;
