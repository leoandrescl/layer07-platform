/** Contacto público — reutilizar en CTAs y WhatsApp. */
export const CONTACT = {
  name: "Leonardo Contreras",
  roleTitle: "Senior Full Stack Engineer | E-commerce & Headless Specialist",
  location: "Santiago, Chile",
  email: "leoandrescl@gmail.com",
  phoneDisplay: "+569 4554 1859",
  /** E.164 sin espacios para tel: y wa.me */
  phoneE164: "56945541859",
} as const;

export const CONTACT_TEL_HREF = `tel:+${CONTACT.phoneE164}`;
export const CONTACT_MAILTO_HREF = `mailto:${CONTACT.email}`;
export const CONTACT_WA_HREF = `https://wa.me/${CONTACT.phoneE164}`;
