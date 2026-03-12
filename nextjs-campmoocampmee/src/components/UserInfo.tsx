"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Tent } from "lucide-react";
import Link from "next/link";

interface UserInfoProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isLandOwner?: boolean;
  onSignOut?: () => void;
  onCloseDialog?: () => void;
  showSignOutButton?: boolean;
  className?: string;
}

export default function UserInfo({
  user,
  isLandOwner = false,
  onSignOut,
  onCloseDialog,
  showSignOutButton = true,
  className = "",
}: UserInfoProps) {
  return (
    <div className={`flex flex-col md:flex-row  gap-2 ${className}`}>
      <div className="flex basis-2/3 flex-row items-center gap-3 w-full">
        {user?.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <p className="font-semibold text-md">{user?.name || "ผู้ใช้งาน"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex flex-row items-center gap-2 mt-2">
            {isLandOwner ? (
              <span className=" inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                <MapPin className="w-3 h-3" />
                เจ้าของลาน
              </span>
            ) : (
              <span className=" inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                <Tent className="w-3 h-3" />
                นักท่องเที่ยว
              </span>
            )}
            <Link
              href="/wishlists"
              onClick={onCloseDialog}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full"
            >
              <Heart className="w-3 h-3" />
              รายการโปรด
            </Link>
          </div>
        </div>
      </div>
      {showSignOutButton && onSignOut && (
        <div className="flex basis-1/3 flex-col items-end justify-end w-full">
          <Button
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className="border-primary text-primary dark:text-primary-foreground hover:text-primary"
          >
            ออกจากระบบ
          </Button>
        </div>
      )}
    </div>
  );
}
