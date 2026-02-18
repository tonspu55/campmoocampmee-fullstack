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
  title?: string,
) => {
  const processedUrl = processVideoUrl(url, platform);
  if (!processedUrl) return null;

  if (platform === "youtube") {
    return `<iframe width="438" height="315" src="${processedUrl}" title="${title || "YouTube video player"}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  // สำหรับ TikTok
  if (platform === "tiktok") {
    // TikTok จะต้องใช้ blockquote embed แทน iframe
    return `<blockquote class="tiktok-embed" cite="${processedUrl}" data-video-id="${title}" style="max-width: 325px; margin: 0 auto; display: block;">
      <section>
        <a target="_blank" title="${title || "TikTok video"}" href="${processedUrl}">Watch the video</a>
      </section>
    </blockquote>`;
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
