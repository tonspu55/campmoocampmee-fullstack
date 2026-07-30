import Link from 'next/link';
import Image from 'next/image';
import { PhoneCall } from 'lucide-react';
import type { SocialContactLinks } from '@/types/social';

interface ContactSocialLinkProps {
  socialContactLinks?: SocialContactLinks;
}

const SOCIAL_ICONS = [
  { key: 'facebook', src: '/assets/images/facebook.png', alt: 'Facebook' },
  { key: 'tiktok', src: '/assets/images/tiktok.png', alt: 'TikTok' },
  { key: 'line', src: '/assets/images/line.png', alt: 'Line' },
  { key: 'instagram', src: '/assets/images/instagram.png', alt: 'Instagram' },
] as const;

const ContactSocialLink = ({ socialContactLinks }: ContactSocialLinkProps) => {
  if (!socialContactLinks) return null;

  return (
    <>
      <h4 className="text-lg md:text-xl font-semibold mb-4 max-lg:px-2">
        ช่องทางการติดต่อ
      </h4>
      <div className="flex gap-2 flex-row justify-between items-center max-lg:px-2">
        {socialContactLinks.phone && (
          <div className="flex flex-row gap-1 items-center">
            <PhoneCall className="w-4 h-4" />
            <Link href={`tel:${socialContactLinks.phone}`}>
              {socialContactLinks.phone}
            </Link>
          </div>
        )}
        <div className="flex gap-2 flex-row">
          {SOCIAL_ICONS.map(({ key, src, alt }) => {
            const href = socialContactLinks[key];
            if (!href) return null;

            return (
              <Link
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={src} alt={alt} width={30} height={30} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ContactSocialLink;
