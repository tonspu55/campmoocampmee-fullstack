import { NextRequest } from "next/server";
import { handleRoute } from "@/server/http";
import { requireSession } from "@/server/session";
import { linkPhoneNumber } from "@/server/phone.service";

// Attach a verified phone number to the logged-in user (add-phone flow).
export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();

  const { phoneNumber, code } = (await req.json().catch(() => ({}))) as {
    phoneNumber?: string;
    code?: string;
  };

  return {
    body: await linkPhoneNumber(session.user.id, {
      phoneNumber: phoneNumber ?? "",
      code: code ?? "",
    }),
  };
}, "เพิ่มเบอร์โทรศัพท์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
