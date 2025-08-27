// ฟังก์ชันช่วยสำหรับแปลง Video URL จาก Sanity
export const processVideoUrl = (url: string, platform: string) => {
  if (!url) return null;

  // สำหรับ YouTube
  if (platform === "youtube") {
    // ถ้าเป็น embed URL อยู่แล้ว
    if (url.includes("/embed/")) {
      return url;
    }

    // ถ้าเป็น watch URL แปลงเป็น embed
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1]?.split("&")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // ถ้าเป็น youtu.be short URL
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  }

  // สำหรับ platform อื่นๆ หรือ direct video URL
  return url;
};

// ฟังก์ชันสร้าง iframe HTML สำหรับวิดีโอ
export const createVideoIframe = (
  url: string,
  platform: string,
  title?: string
) => {
  const processedUrl = processVideoUrl(url, platform);
  if (!processedUrl) return null;

  if (platform === "youtube") {
    return `<iframe width="560" height="315" src="${processedUrl}" title="${title || "YouTube video player"}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  if (platform === "tiktok") {
    // TikTok จะต้องใช้ blockquote embed แทน iframe
    return `<iframe src="${processedUrl}" width="325" height="580" frameborder="0" scrolling="no" allow="encrypted-media" allowfullscreen></iframe>`;
  }

  // สำหรับ platform อื่นๆ
  return `<iframe src="${processedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
};

// ฟังก์ชันแปลงข้อมูลจาก Sanity เป็นรูปแบบที่ TabGallery ใช้ได้
interface SanityGalleryItem {
  _type: "image" | "video" | "videoUrl";
  asset?: { url: string };
  category?: string;
  alt?: string;
  embedCode?: string;
  platform?: string;
  url?: string;
  title?: string;
}

export const transformGalleryData = (sanityGallery: SanityGalleryItem[]) => {
  return sanityGallery
    .map((item) => {
      // รูปภาพ
      if (item._type === "image") {
        return {
          _type: "image",
          url: item.asset?.url,
          category: item.category,
          alt: item.alt,
        };
      }

      // Video embed code (แบบเดิม)
      if (item._type === "video" && item.embedCode) {
        return {
          _type: "video",
          embedCode: item.embedCode,
          platform: item.platform,
          category: item.category || "วิดีโอ",
        };
      }

      // Video URL (แบบใหม่)
      if (item._type === "videoUrl" && item.url && item.platform) {
        const embedCode = createVideoIframe(
          item.url,
          item.platform,
          item.title
        );
        return {
          _type: "video" as const,
          embedCode: embedCode,
          platform: item.platform,
          category: item.category || "วิดีโอ",
          title: item.title,
        };
      }

      return null;
    })
    .filter(Boolean);
};
