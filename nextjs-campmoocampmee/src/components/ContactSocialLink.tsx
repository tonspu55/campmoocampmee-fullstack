"use client";

import Link from "next/link";
import Image from "next/image";
import { PhoneCall } from "lucide-react";

type SocialContactLinks = {
  facebook?: string;
  line?: string;
  instagram?: string;
  tiktok?: string;
  googleMap?: string;
  phone?: string;
};

interface ContactSocialLinkProps {
  socialContactLinks: SocialContactLinks;
}

const ContactSocialLink = ({ socialContactLinks }: ContactSocialLinkProps) => {
  if (!socialContactLinks) return null;

  return (
    <>
      <h4 className="text-lg md:text-xl font-semibold mb-4 max-lg:px-2">
        ช่องทางการติดต่อ
      </h4>
      <div className="flex flex-col gap-4">
        <div className="flex  gap-2 flex-row justify-between items-center max-lg:px-2">
          {socialContactLinks.phone && (
            <div className="flex flex-row gap-1 items-center">
              <PhoneCall className="w-4 h-4 " />
              <Link href={`tel:${socialContactLinks.phone}`}>
                {socialContactLinks.phone}
              </Link>
            </div>
          )}
          <div className="flex gap-2 flex-row">
            {socialContactLinks.facebook && (
              <Link href={socialContactLinks.facebook} target="_blank">
                <Image
                  priority
                  src="/assets/images/facebook.png"
                  alt="Facebook"
                  width={30}
                  height={30}
                ></Image>
              </Link>
            )}
            {socialContactLinks.tiktok && (
              <Link href={socialContactLinks.tiktok} target="_blank">
                <Image
                  priority
                  src="/assets/images/tiktok.png"
                  alt="TikTok"
                  width={30}
                  height={30}
                ></Image>
              </Link>
            )}
            {socialContactLinks.line && (
              <Link href={socialContactLinks.line} target="_blank">
                <Image
                  priority
                  src="/assets/images/line.png"
                  alt="Line"
                  width={30}
                  height={30}
                ></Image>
              </Link>
            )}
            {socialContactLinks.instagram && (
              <Link href={socialContactLinks.instagram} target="_blank">
                <Image
                  priority
                  src="/assets/images/instagram.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                ></Image>
              </Link>
            )}
          </div>
        </div>

        {socialContactLinks.googleMap && (
          <iframe
            src={socialContactLinks.googleMap}
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </>
  );
};

export default ContactSocialLink;
