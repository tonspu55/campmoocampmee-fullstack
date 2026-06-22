// Abstract SMS sender. Keeps the Better Auth phoneNumber plugin decoupled from
// any specific Thai SMS gateway — swap providers by changing env + the payload
// mapping below, without touching auth logic.

import { toE164TH } from "@/lib/phone";

const SMS_API_URL = process.env.SMS_API_URL;
const SMS_API_TOKEN = process.env.SMS_API_TOKEN;
const SMS_SENDER = process.env.SMS_SENDER;

/**
 * Send an SMS message. Throws on failure so callers (e.g. Better Auth's
 * sendOTP) can surface the error and avoid silently dropping OTPs.
 *
 * If env is not configured (typical in local dev), it logs the message to the
 * server console instead of throwing, so the OTP flow stays testable.
 */
export async function sendSms(to: string, message: string): Promise<void> {
  const phone = toE164TH(to);

  if (!SMS_API_URL || !SMS_API_TOKEN) {
    console.warn(
      `[sms] SMS provider not configured. Would send to ${phone}: ${message}`,
    );
    return;
  }

  // NOTE: map this payload to the chosen Thai provider's API contract.
  const res = await fetch(SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SMS_API_TOKEN}`,
    },
    body: JSON.stringify({
      to: phone,
      sender: SMS_SENDER,
      message,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SMS send failed (${res.status}): ${body}`);
  }
}
