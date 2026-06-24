import { NextRequest } from "next/server";
import { handleRoute, ApiError } from "@/server/http";
import { requireSession } from "@/server/session";
import { getSanityUserIdByEmail } from "@/server/users.service";
import {
  getFavoriteIds,
  getFavoritePosts,
  addFavorite,
  removeFavorite,
} from "@/server/wishlist.service";

export const GET = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const userId = await getSanityUserIdByEmail(session.user.email);

  const full = new URL(req.url).searchParams.get("full") === "true";
  return { body: full ? await getFavoritePosts(userId) : await getFavoriteIds(userId) };
}, "เกิดข้อผิดพลาดในการดึงข้อมูลรายการโปรด");

export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const { postId } = await req.json();
  if (!postId) throw new ApiError(400, "กรุณาระบุ postId");

  const userId = await getSanityUserIdByEmail(session.user.email);
  return await addFavorite(userId, postId);
}, "เกิดข้อผิดพลาดในการเพิ่มรายการโปรด");

export const DELETE = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const { postId } = await req.json();
  if (!postId) throw new ApiError(400, "กรุณาระบุ postId");

  const userId = await getSanityUserIdByEmail(session.user.email);
  return { body: await removeFavorite(userId, postId) };
}, "เกิดข้อผิดพลาดในการลบรายการโปรด");
