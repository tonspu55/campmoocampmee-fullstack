import { cn } from "@/lib/utils";
import type { GalleryVideoItem } from "@/types/gallery";

const ASPECT_RATIO: Record<GalleryVideoItem["platform"], string> = {
  youtube: "16 / 9",
  tiktok: "9 / 16",
};

const DEFAULT_TITLE: Record<GalleryVideoItem["platform"], string> = {
  youtube: "YouTube video player",
  tiktok: "TikTok video player",
};

interface VideoEmbedProps {
  item: GalleryVideoItem;
  className?: string;
}

/**
 * เรนเดอร์ iframe เป็น JSX ตรงๆ — ไม่ประกอบ HTML เป็น string
 * เพื่อไม่ต้องพึ่ง dangerouslySetInnerHTML และไม่ต้อง escape เอง
 */
const VideoEmbed = ({ item, className }: VideoEmbedProps) => (
  <div
    className={cn(
      "mx-auto w-full",
      item.platform === "tiktok" && "max-w-[325px]",
      className,
    )}
    style={{ aspectRatio: ASPECT_RATIO[item.platform] }}
  >
    <iframe
      src={item.embedUrl}
      title={item.title || DEFAULT_TITLE[item.platform]}
      className="h-full w-full rounded-lg border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
    />
  </div>
);

export default VideoEmbed;
