import { client } from "@/sanity/client";
import { ApiError } from "./http";
import type { RouteResult } from "./http";

// Just the favorited post ids for the user (used to hydrate heart states).
export async function getFavoriteIds(userId: string) {
  const favorites = await client.fetch<{ postId: string }[]>(
    '*[_type == "favorite" && user._ref == $userId]{ "postId": post._ref }',
    { userId },
  );
  return { favoriteIds: favorites.map((f) => f.postId) };
}

// Full post payloads for the wishlist page.
export async function getFavoritePosts(userId: string) {
  const favorites = await client.fetch<{ post: unknown }[]>(
    `*[_type == "favorite" && user._ref == $userId] | order(createdAt desc) {
      "post": post->{
        _id,
        title,
        slug,
        thumbnail,
        "otherBenefits": otherBenefits{ priceOfStay },
        "address": address{ province, district }
      }
    }`,
    { userId },
  );
  return { posts: favorites.map((f) => f.post).filter(Boolean) };
}

// Add a favorite. Idempotent: returns 200 when it already exists, 201 when
// newly created. The existence check guards against double-click races.
export async function addFavorite(
  userId: string,
  postId: string,
): Promise<RouteResult> {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type == "favorite" && user._ref == $userId && post._ref == $postId][0]{_id}',
    { userId, postId },
  );
  if (existing) {
    return {
      status: 200,
      body: { message: "อยู่ในรายการโปรดแล้ว", favoriteId: existing._id },
    };
  }

  const newFavorite = await client.create({
    _type: "favorite",
    user: { _type: "reference", _ref: userId },
    post: { _type: "reference", _ref: postId },
    createdAt: new Date().toISOString(),
  });

  return {
    status: 201,
    body: { message: "เพิ่มในรายการโปรดแล้ว", favoriteId: newFavorite._id },
  };
}

// Remove a favorite. Throws 404 if it does not exist.
export async function removeFavorite(userId: string, postId: string) {
  const favorite = await client.fetch<{ _id: string } | null>(
    '*[_type == "favorite" && user._ref == $userId && post._ref == $postId][0]{_id}',
    { userId, postId },
  );
  if (!favorite) throw new ApiError(404, "ไม่พบรายการโปรดนี้");

  await client.delete(favorite._id);
  return { message: "ลบออกจากรายการโปรดแล้ว" };
}
