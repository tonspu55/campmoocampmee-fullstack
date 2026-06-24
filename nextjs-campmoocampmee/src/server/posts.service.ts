import { client } from "@/sanity/client";
import { ApiError } from "./http";

// List a landowner's published posts (drafts excluded), newest first.
export async function listLandownerPosts(providerId: string) {
  const posts = await client.fetch(
    `*[_type == "post" && $providerId in providerIds && !(_id in path("drafts.**"))] | order(publishedAt desc){
      _id,
      title,
      slug,
      thumbnail,
      publishedAt,
      address,
      "imageCount": count(gallery),
      "videoCount": count(videos)
    }`,
    { providerId },
  );
  return posts || [];
}

// Fetch a single post the landowner owns. Throws 404 if missing, 403 if the
// providerId is not among the post's providerIds.
export async function getLandownerPost(postId: string, providerId: string) {
  const post = await client.fetch(
    `*[_type == "post" && _id == $postId && !(_id in path("drafts.**"))][0]{
      _id,
      title,
      slug,
      thumbnail{
        _type,
        asset->{
          _id,
          url
        }
      },
      providerIds,
      address,
      gallery[]{
        _key,
        _type,
        asset->{
          _id,
          url
        },
        category,
        alt,
        url,
        title,
        platform
      },
      body[]{
        _key,
        _type,
        style,
        children[]{
          _key,
          _type,
          text,
          marks
        },
        markDefs,
        listItem,
        level
      },
      socialContactLinks,
      otherBenefits
    }`,
    { postId },
  );

  if (!post) throw new ApiError(404, "ไม่พบข้อมูลลาน");
  if (!post.providerIds?.includes(providerId)) {
    throw new ApiError(403, "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }
  return post;
}

type PostUpdateInput = {
  thumbnail?: unknown;
  address?: unknown;
  gallery?: Record<string, unknown>[];
  body?: Record<string, unknown>[];
  socialContactLinks?: unknown;
  otherBenefits?: unknown;
};

const randomKey = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

// Sanity array items require a stable _key; backfill any that are missing.
function withGalleryKeys(gallery: Record<string, unknown>[]) {
  return gallery.map((item, index) =>
    item._key ? item : { ...item, _key: `${item._type}-${randomKey()}-${index}` },
  );
}

function withBodyKeys(body: Record<string, unknown>[]) {
  return body.map((block, index) => {
    const keyed = block._key ? block : { ...block, _key: `block-${randomKey()}-${index}` };
    if (Array.isArray(keyed.children)) {
      keyed.children = (keyed.children as Record<string, unknown>[]).map(
        (child, childIndex) =>
          child._key
            ? child
            : { ...child, _key: `span-${randomKey()}-${index}-${childIndex}` },
      );
    }
    return keyed;
  });
}

// Update a post the landowner owns. Throws 404/403 on ownership failure.
export async function updateLandownerPost(
  postId: string,
  providerId: string,
  data: PostUpdateInput,
) {
  const post = await client.fetch<{ _id: string; providerIds?: string[] } | null>(
    `*[_type == "post" && _id == $postId && !(_id in path("drafts.**"))][0]{_id, providerIds}`,
    { postId },
  );

  if (!post) throw new ApiError(404, "ไม่พบข้อมูลลาน");
  if (!post.providerIds?.includes(providerId)) {
    throw new ApiError(403, "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้");
  }

  const updateData: Record<string, unknown> = {};
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.gallery !== undefined) updateData.gallery = withGalleryKeys(data.gallery);
  if (data.body !== undefined) updateData.body = withBodyKeys(data.body);
  if (data.socialContactLinks !== undefined)
    updateData.socialContactLinks = data.socialContactLinks;
  if (data.otherBenefits !== undefined) updateData.otherBenefits = data.otherBenefits;

  return await client.patch(postId).set(updateData).commit();
}
