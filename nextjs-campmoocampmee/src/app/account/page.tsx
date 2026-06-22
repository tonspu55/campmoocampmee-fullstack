'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Tent,
  User,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useLandOwnerStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { isLandOwner, fetchPosts, reset } = useLandOwnerStore();

  // Redirect unauthenticated users to sign-in.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/auth/signin?callbackUrl=/account');
    }
  }, [isPending, session, router]);

  // Determine land-owner status to show the dashboard shortcut.
  useEffect(() => {
    if (session) fetchPosts();
  }, [session, fetchPosts]);

  const handleSignOut = async () => {
    reset();
    useWishlistStore.getState().reset();
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/') },
    });
  };

  if (isPending || !session) {
    return (
      <main className="py-12 lg:py-16 mt-15">
        <div className="container mx-auto max-w-lg px-4">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  const user = session.user;

  return (
    <main className="py-12 lg:py-16 mt-15">
      <div className="container mx-auto max-w-lg px-4">
        <h1 className="text-2xl font-semibold mb-6">บัญชีของฉัน</h1>

        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-6 ">
            {/* Profile */}
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="size-8 text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">
                  {user.name || 'ผู้ใช้งาน'}
                </p>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {isLandOwner ? (
                    <>
                      <MapPin className="size-3" />
                      เจ้าของลาน
                    </>
                  ) : (
                    <>
                      <Tent className="size-3" />
                      นักท่องเที่ยว
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Menu */}
            <nav className="flex flex-col">
              <AccountLink
                href="/wishlists"
                icon={<Heart className="size-5" />}
              >
                รายการโปรด
              </AccountLink>
              {isLandOwner && (
                <AccountLink
                  href="/landowner"
                  icon={<LayoutDashboard className="size-5" />}
                >
                  แดชบอร์ดเจ้าของลาน
                </AccountLink>
              )}
            </nav>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full gap-2 border-primary text-primary hover:text-primary dark:text-primary-foreground"
            >
              <LogOut className="size-4" />
              ออกจากระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function AccountLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm transition-colors hover:bg-muted"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 font-medium">{children}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
