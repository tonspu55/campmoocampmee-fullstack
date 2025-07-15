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
import { Share } from "lucide-react";

interface ShareToSocialProps {
  title?: string;
  slug?: string;
}

const ShareToSocial = ({ title, slug }: ShareToSocialProps) => {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer" variant="default"><Share /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-30 border-primary">
          <div className="flex flex-row gap-2 justify-center">
            <FacebookShareButton
              url={slug ? `https://campnaidee.com/land/${slug}` : `https://campnaidee.com`}
              quote={`ดูที่พัก ${title} ได้ที่ campnaidee.com`}
              hashtag={'#campnaidee'}
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
              url={slug ? `https://campnaidee.com/land/${slug}` : `https://campnaidee.com`}
              title={`ดูที่พัก ${title} ได้ที่ campnaidee.com`}
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