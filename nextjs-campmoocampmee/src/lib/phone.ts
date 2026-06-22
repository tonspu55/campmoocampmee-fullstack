// Shared phone-number helpers, safe to import from both client and server.

/**
 * Normalize a Thai phone number to E.164 (+66...).
 * Accepts local format (08xxxxxxxx / +66 / 66 / with spaces or dashes).
 */
export function toE164TH(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+66")) return digits;
  if (digits.startsWith("66")) return `+${digits}`;
  // Local "0xxxxxxxxx" -> "+66xxxxxxxxx"
  if (digits.startsWith("0")) return `+66${digits.slice(1)}`;
  if (digits.startsWith("+")) return digits;
  return `+66${digits}`;
}

/** True when the input looks like a valid Thai mobile number. */
export function isValidThaiMobile(input: string): boolean {
  const digits = input.replace(/[^\d]/g, "");
  // 0XXXXXXXXX (local, 10 digits)
  if (/^0[689]\d{8}$/.test(digits)) return true;
  // XXXXXXXXX (9 digits, no leading 0 — typed alongside a "+66" prefix)
  if (/^[689]\d{8}$/.test(digits)) return true;
  // 66XXXXXXXXX (with country code)
  if (/^66[689]\d{8}$/.test(digits)) return true;
  return false;
}
