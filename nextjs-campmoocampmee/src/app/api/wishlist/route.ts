import { NextRequest } from "next/server";
import { handleRoute, ApiError } from "@/server/http";
import { requireSession } from "@/server/session";
import { resolveSanityUserId } from "@/server/users.service";
import {
  getFavoriteIds,
  getFavoritePosts,
  addFavorite,
  removeFavorite,
} from "@/server/wishlist.service";

export const GET = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const userId = await resolveSanityUserId(session.user.id);

  const full = new URL(req.url).searchParams.get("full") === "true";
  return { body: full ? await getFavoritePosts(userId) : await getFavoriteIds(userId) };
}, "เกิดข้อผิดพลาดในการดึงข้อมูลรายการโปรด");

export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const { postId } = await req.json();
  if (!postId) throw new ApiError(400, "กรุณาระบุ postId");

  const userId = await resolveSanityUserId(session.user.id);
  return await addFavorite(userId, postId);
}, "เกิดข้อผิดพลาดในการเพิ่มรายการโปรด");

export const DELETE = handleRoute(async (req: NextRequest) => {
  const session = await requireSession();
  const { postId } = await req.json();
  if (!postId) throw new ApiError(400, "กรุณาระบุ postId");

  const userId = await resolveSanityUserId(session.user.id);
  return { body: await removeFavorite(userId, postId) };
}, "เกิดข้อผิดพลาดในการลบรายการโปรด");
