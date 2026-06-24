import { NextRequest } from "next/server";
import { handleRoute } from "@/server/http";
import { requireSession } from "@/server/session";
import { getProviderIdByEmail } from "@/server/users.service";
import { getLandownerPost, updateLandownerPost } from "@/server/posts.service";

type RouteContext = { params: Promise<{ postId: string }> };

// ดึงข้อมูล post ตาม ID
export const GET = handleRoute<RouteContext>(async (_req, context) => {
  const { postId } = await context.params;
  const session = await requireSession();
  const providerId = await getProviderIdByEmail(session.user.email);

  const post = await getLandownerPost(postId, providerId);
  return { body: { post } };
}, "เกิดข้อผิดพลาดในการดึงข้อมูล");

// อัพเดทข้อมูล post
export const PATCH = handleRoute<RouteContext>(async (req: NextRequest, context) => {
  const { postId } = await context.params;
  const session = await requireSession();
  const providerId = await getProviderIdByEmail(session.user.email);

  const body = await req.json();
  const post = await updateLandownerPost(postId, providerId, body);
  return { body: { message: "อัพเดทข้อมูลสำเร็จ", post } };
}, "เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
