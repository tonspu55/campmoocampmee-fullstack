'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  FacebookShareButton,
  LineShareButton
} from 'next-share'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share, Link2, Check } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface ShareToSocialProps {
  title?: string;
  slug?: string;
}

const ShareToSocial = ({ title, slug }: ShareToSocialProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentDomain = `${window.location.protocol}//${window.location.host}`;
      setBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || currentDomain);
    }
  }, []);

  const currentUrl = slug ? `${baseUrl}/land/${slug}` : baseUrl;

  const handleCopyUrl = useCallback(async () => {
    try {
      // ตรวจสอบว่า clipboard API สามารถใช้งานได้หรือไม่
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('คัดลอก URL เรียบร้อย', {
          duration: 2000,
        });
      } else {
        // Fallback method สำหรับ browser ที่ไม่รองรับ clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';

        try {
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('คัดลอก URL เรียบร้อย', {
              duration: 2000,
            });
          } else {
            console.error('execCommand copy failed');
          }
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        } finally {
          // ใช้ finally เพื่อให้แน่ใจว่า element ถูกลบออกเสมอ
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, [currentUrl]);
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer" variant="default"><Share /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-34 border-none" >
          <div className="flex flex-row gap-2 justify-center" >
            <Button
              onClick={() => {
                handleCopyUrl();
                setOpen(true);
              }}
              variant="default"
              className="flex justify-center rounded-full cursor-pointer h-[30px] w-[30px]"
            >
              {copied ? (
                <Check />
              ) : (
                <Link2 />
              )}
            </Button>
            <FacebookShareButton
              url={currentUrl}
              quote={`ดูที่พัก ${title} ได้ที่ campmoocampmee.com`}
              hashtag={'#campmoocampmee'}
            >
              <Image
                priority
                src="/assets/images/facebook.png"
                alt="Facebook"
                width={30}
                height={30}
              ></Image>
            </FacebookShareButton>
            <LineShareButton
              url={currentUrl}
              title={`ดูที่พัก ${title} ได้ที่ campmoocampmee.com`}
            >
              <Image
                priority
                src="/assets/images/line.png"
                alt="Line"
                width={30}
                height={30}
              ></Image>
            </LineShareButton>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default ShareToSocial;