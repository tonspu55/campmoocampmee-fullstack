import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { toE164TH, isValidThaiMobile } from "@/lib/phone";
import { ApiError } from "./http";
import { getUserIdentity } from "./identity.service";
import { upsertSanityUser } from "./users.service";

// Map Better Auth's phoneNumber-plugin error codes to Thai messages + HTTP
// status. Codes come from the thrown APIError's `body.code` (see
// better-auth/plugins/phone-number/error-codes). Messages mirror the login
// form (PhoneOtpForm.tsx) so the UX is consistent.
function mapVerifyError(code: string | undefined): ApiError | null {
  switch (code) {
    case "PHONE_NUMBER_EXIST":
      return new ApiError(409, "เบอร์นี้ถูกใช้กับบัญชีอื่นแล้ว");
    case "OTP_EXPIRED":
      return new ApiError(400, "รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่");
    case "TOO_MANY_ATTEMPTS":
      return new ApiError(
        400,
        "กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่",
      );
    case "OTP_NOT_FOUND":
    case "INVALID_OTP":
      return new ApiError(400, "รหัส OTP ไม่ถูกต้อง");
    default:
      return null;
  }
}

type LinkPhoneInput = { phoneNumber: string; code: string };

// Attach a verified phone number to the logged-in user (e.g. a Google user
// adding a phone). Better Auth's verify endpoint with `updatePhoneNumber: true`
// requires an active session, rejects numbers already taken by another user
// (PHONE_NUMBER_EXIST), and writes phoneNumber + phoneNumberVerified to Postgres
// without creating a new user/session. We then best-effort mirror to Sanity.
export async function linkPhoneNumber(userId: string, input: LinkPhoneInput) {
  if (!isValidThaiMobile(input.phoneNumber)) {
    throw new ApiError(400, "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง");
  }
  if (!/^\d{6}$/.test(input.code)) {
    throw new ApiError(400, "รหัส OTP ไม่ถูกต้อง");
  }
  const phoneE164 = toE164TH(input.phoneNumber);

  // 1) Better Auth — verify OTP and attach to the current session's user.
  try {
    await auth.api.verifyPhoneNumber({
      body: { phoneNumber: phoneE164, code: input.code, updatePhoneNumber: true },
      headers: await headers(),
    });
  } catch (err) {
    const code = (err as { body?: { code?: string } })?.body?.code;
    const mapped = mapVerifyError(code);
    if (mapped) throw mapped;
    throw err;
  }

  // 2) Sanity mirror — best-effort, never blocks the response.
  try {
    const identity = await getUserIdentity(userId);
    await upsertSanityUser(
      {
        name: identity.name,
        email: identity.email,
        image: identity.image,
        phoneNumber: identity.phoneNumber,
        provider: identity.provider,
        providerId: identity.providerId,
      },
      { phoneNumber: phoneE164 },
    );
  } catch (err) {
    console.error("Sanity phone sync error:", err);
  }

  return { phoneNumber: phoneE164 };
}
