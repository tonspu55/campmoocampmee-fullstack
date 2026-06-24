import { NextRequest } from "next/server";
import { handleRoute } from "@/server/http";
import { requireSession } from "@/server/session";
import { updateProfile } from "@/server/profile.service";

// Update the logged-in user's profile (name + optional avatar image).
export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();

  const formData = await req.formData();
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const file = formData.get("file") as File | null;

  return { body: await updateProfile(session.user.id, { name, file }) };
}, "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
