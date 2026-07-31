import { urlFor } from "@/sanity/client";
import {
  hasImageAsset,
  type GalleryImageItem,
  type GalleryItem,
  type GalleryVideoItem,
  type SanityImageItem,
  type SanityVideoItem,
  type VideoPlatform,
} from "@/types/gallery";

/** ความกว้างรูปในหน้าอัลบั้ม — grid สูงสุด ~900px, popup เต็มจอ */
const GRID_IMAGE_WIDTH = 900;
const FULL_IMAGE_WIDTH = 1920;

const SUPPORTED_PLATFORMS: VideoPlatform[] = ["youtube", "tiktok"];

const isSupportedPlatform = (
  platform: string | undefined,
): platform is VideoPlatform =>
  !!platform && SUPPORTED_PLATFORMS.includes(platform as VideoPlatform);

/**
 * แปลง URL วิดีโอที่แอดมินวางไว้เป็น embed URL
 * คืน null ถ้าแปลงไม่ได้ หรือไม่ใช่ https (กัน javascript:/data: หลุดเข้า iframe src)
 */
export const processVideoUrl = (
  url: string,
  platform: VideoPlatform,
): string | null => {
  if (!url) return null;

  let embedUrl: string | null = null;

  if (platform === "youtube") {
    if (url.includes("/embed/")) {
      embedUrl = url;
    } else if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1]?.split("&")[0];
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  }

  if (platform === "tiktok") {
    // รูปแบบ tiktok.com/@user/video/1234567890
    const videoId = url.match(/\/video\/(\d+)/)?.[1];
    embedUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null;
  }

  return embedUrl?.startsWith("https://") ? embedUrl : null;
};

/**
 * แปลงข้อมูลจาก Sanity เป็นรูปแบบที่ TabGallery ใช้ (ทิ้ง item ที่ข้อมูลไม่ครบ)
 *
 * โพสต์ที่ยังไม่มี field `gallery`/`videos` เลย GROQ จะคืน `null` (ไม่ใช่ `undefined`)
 * ซึ่ง default parameter ไม่ครอบให้ — เลย normalize เป็น array เองตรงนี้
 */
export const transformGalleryData = (
  galleryImages?: SanityImageItem[] | null,
  videos?: SanityVideoItem[] | null,
): GalleryItem[] => {
  const imageItems = (galleryImages ?? []).flatMap<GalleryImageItem>((item, index) => {
    if (!hasImageAsset(item)) return [];
    return [
      {
        _type: "image",
        _key: item._key ?? `image-${index}`,
        url: urlFor(item).width(GRID_IMAGE_WIDTH).quality(80).url(),
        fullUrl: urlFor(item).width(FULL_IMAGE_WIDTH).quality(85).url(),
        category: item.category || "วิว",
        alt: item.alt || null,
      },
    ];
  });

  const videoItems = (videos ?? []).flatMap<GalleryVideoItem>((item, index) => {
    if (item._type !== "videoUrl" || !item.url) return [];
    if (!isSupportedPlatform(item.platform)) return [];

    const embedUrl = processVideoUrl(item.url, item.platform);
    if (!embedUrl) return [];

    return [
      {
        _type: "video",
        _key: item._key ?? `video-${index}`,
        embedUrl,
        platform: item.platform,
        category: item.category || "วิดีโอ",
        title: item.title || null,
      },
    ];
  });

  return [...imageItems, ...videoItems];
};
