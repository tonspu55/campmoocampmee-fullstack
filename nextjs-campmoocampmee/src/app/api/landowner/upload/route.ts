import { NextRequest } from "next/server";
import { handleRoute, ApiError } from "@/server/http";
import { requireSession } from "@/server/session";
import { getProviderIdByEmail } from "@/server/users.service";
import { validateAndUploadImage } from "@/server/media.service";

export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  // Authorize: only registered landowners may upload.
  await getProviderIdByEmail(session.user.email);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) throw new ApiError(400, "ไม่พบไฟล์");

  const asset = await validateAndUploadImage(file, 5);
  return { body: { assetId: asset._id, url: asset.url } };
}, "เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
