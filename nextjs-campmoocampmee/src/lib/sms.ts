// SMS sender — wired to deeSMSx (https://deesmsx.com). Keeps the Better Auth
// phoneNumber plugin decoupled from the gateway: Better Auth generates/verifies
// the OTP itself, this only delivers the message via deeSMSx's plain SMS API.
// Swap providers by changing env + the payload mapping below.

import { toE164TH } from "@/lib/phone";

const SMS_API_URL =
  process.env.SMS_API_URL || "https://apicall.deesmsx.com/v1/SMSWebService";
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SECRET_KEY = process.env.SMS_SECRET_KEY;
const SMS_SENDER = process.env.SMS_SENDER;

/**
 * Send an SMS message via deeSMSx. Throws on failure so callers (e.g. Better
 * Auth's sendOTP) can surface the error and avoid silently dropping OTPs.
 *
 * If credentials are not configured (typical in local dev), it logs the message
 * to the server console instead of throwing, so the OTP flow stays testable.
 */
export async function sendSms(to: string, message: string): Promise<void> {
  // deeSMSx expects E.164 without the leading "+" (e.g. 66812345678).
  const phone = toE164TH(to).replace(/^\+/, "");

  if (!SMS_API_KEY || !SMS_SECRET_KEY || !SMS_SENDER) {
    console.warn(
      `[sms] deeSMSx not configured. Would send to ${phone}: ${message}`,
    );
    return;
  }

  const res = await fetch(SMS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: SMS_API_KEY,
      secretKey: SMS_SECRET_KEY,
      to: phone,
      sender: SMS_SENDER,
      msg: message,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SMS send failed (${res.status}): ${body}`);
  }

  // deeSMSx SMSWebService returns HTTP 200 with a JSON body; `code: "0"` means
  // success. Anything else is a logical failure — e.g. 100 = sender name not
  // approved/whitelisted, 99 = invalid phone format, 102 = not enough credit.
  const data = (await res.json().catch(() => null)) as {
    code?: string | number;
    msg?: string;
  } | null;
  if (data && String(data.code ?? "") !== "0") {
    throw new Error(`SMS send failed [${data.code}]: ${data.msg ?? ""}`);
  }
}
