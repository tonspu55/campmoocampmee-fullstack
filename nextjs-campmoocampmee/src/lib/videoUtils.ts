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

  // สำหรับ TikTok
  if (platform === "tiktok") {
    // ดึง video ID จาก URL รูปแบบ tiktok.com/@user/video/1234567890
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (videoIdMatch?.[1]) {
      return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
    }
    // ถ้าเป็น URL รูปแบบอื่น ส่งกลับ url เดิม
    return url;
  }

  // สำหรับ platform อื่นๆ หรือ direct video URL
  return url;
};

// ฟังก์ชันสร้าง iframe HTML สำหรับวิดีโอ
export const createVideoIframe = (
  url: string,
  platform: string,
  title?: string,
) => {
  const processedUrl = processVideoUrl(url, platform);
  if (!processedUrl) return null;

  if (platform === "youtube") {
    return `<iframe width="438" height="315" src="${processedUrl}" title="${title || "YouTube video player"}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  // สำหรับ TikTok
  if (platform === "tiktok") {
    return `<iframe src="${processedUrl}" width="325" height="578" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="max-width:100%; border-radius:8px;"></iframe>`;
  }

  // สำหรับ platform อื่นๆ
  return `<iframe src="${processedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
};

// ฟังก์ชันแปลงข้อมูลจาก Sanity เป็นรูปแบบที่ TabGallery ใช้ได้
interface SanityImageItem {
  _type: "image";
  asset?: { url: string };
  category?: string;
  alt?: string;
}

interface SanityVideoItem {
  _type: "videoUrl";
  url?: string;
  platform?: string;
  category?: string;
  title?: string;
}

export const transformGalleryData = (
  galleryImages: SanityImageItem[],
  videos: SanityVideoItem[] = [],
) => {
  // แปลงข้อมูลรูปภาพ
  const imageItems = galleryImages.map((item) => {
    if (item._type === "image" && item.asset?.url) {
      return {
        _type: "image" as const,
        url: item.asset.url,
        category: item.category || "วิว",
        alt: item.alt,
      };
    }
    return null;
  });

  // แปลงข้อมูลวิดีโอ
  const videoItems = videos.map((item) => {
    if (item._type === "videoUrl" && item.url && item.platform) {
      const embedCode = createVideoIframe(item.url, item.platform, item.title);
      return {
        _type: "video" as const,
        embedCode: embedCode,
        platform: item.platform,
        category: item.category || "วิดีโอ",
        title: item.title,
      };
    }
    return null;
  });

  // รวมข้อมูลทั้งหมด
  return [...imageItems, ...videoItems].filter(Boolean);
};
