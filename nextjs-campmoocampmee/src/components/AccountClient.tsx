'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Camera,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Tent,
  User,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useLandOwnerStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

// Schema สำหรับ validation ฟอร์มแก้ไขโปรไฟล
const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'กรุณากรอกชื่อ' })
    .max(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' }),
  image: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_IMAGE_SIZE, {
      message: 'ขนาดไฟล์ต้องไม่เกิน 1MB',
    })
    .refine((f) => f.type.startsWith('image/'), {
      message: 'อนุญาตเฉพาะไฟล์รูปภาพ',
    })
    .optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface AccountClientProps {
  /** Server-resolved user — guarantees content without a client spinner. */
  initialUser: { name?: string | null; image?: string | null };
}

export default function AccountClient({ initialUser }: AccountClientProps) {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const { isLandOwner, fetchPosts, reset } = useLandOwnerStore();

  // Prefer the live client session (reflects edits after refetch),
  // fall back to the server-provided user on first paint.
  const user = session?.user ?? initialUser;

  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', image: undefined },
  });

  // Determine land-owner status to show the dashboard shortcut.
  // Auth is already guaranteed by the server component.
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Revoke object URL preview when it changes/unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSignOut = async () => {
    reset();
    useWishlistStore.getState().reset();
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/') },
    });
  };

  const startEdit = () => {
    form.reset({ name: user.name || '', image: undefined });
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    form.reset({ name: '', image: undefined });
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    form.setValue('image', file, { shouldValidate: true });
  };

  const onSubmit = async (values: ProfileValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    if (values.image) fd.append('file', values.image);

    const res = await fetch('/api/account/profile', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      return;
    }
    toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
    await refetch?.();
    cancelEdit();
  };

  const avatarSrc = imagePreview ?? user.image ?? null;
  const isSubmitting = form.formState.isSubmitting;

  const avatar = (
    <div className="relative">
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={user.name || 'User'}
          width={64}
          height={64}
          className="size-16 rounded-full object-cover"
          unoptimized={!!imagePreview}
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <User className="size-8 text-primary" />
        </div>
      )}
      {editing && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="เปลี่ยนรูปโปรไฟล์"
          className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow ring-2 ring-background"
        >
          <Camera className="size-3.5" />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickImage}
      />
    </div>
  );

  const roleBadge = (
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
  );

  return (
    <main className="py-12 lg:py-16 mt-15">
      <div className="container mx-auto max-w-lg px-4">
        <h1 className="text-2xl font-semibold mb-6">บัญชีของฉัน</h1>

        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-6 ">
            {editing ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    {avatar}
                    <div className="flex flex-1 flex-col gap-1">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="ชื่อของคุณ"
                                maxLength={100}
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ข้อความ error ของรูปภาพ (จาก schema) */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem className="-mt-4">
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      variant="outline"
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                {/* Profile */}
                <div className="flex items-center gap-4">
                  {avatar}
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-lg font-semibold">
                      {user.name || 'ผู้ใช้งาน'}
                    </p>
                    {roleBadge}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEdit}
                    className="gap-1 text-muted-foreground"
                  >
                    <Pencil className="size-4" />
                    แก้ไข
                  </Button>
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
              </>
            )}
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
