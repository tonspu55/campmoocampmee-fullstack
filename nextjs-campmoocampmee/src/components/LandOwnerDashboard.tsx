"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ImageIcon, Video } from "lucide-react";
import { useLandOwnerStore } from "@/lib/store";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function LandOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { posts, loading, error, fetchPosts } = useLandOwnerStore();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin-landowner");
      return;
    }

    fetchPosts();
  }, [session, status, router, fetchPosts]);

  const handleEdit = (postId: string) => {
    router.push(`/landowner/edit/${postId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1].map((i) => (
            <Card key={i} className="overflow-hidden border-0 pt-0">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold">จัดการข้อมูลลานกางเต็นท์</h1>

      {posts.length === 0 ? (
        <Card className="border-0">
          <CardHeader>
            <CardTitle>ไม่พบข้อมูลลาน</CardTitle>
            <CardDescription>
              คุณยังไม่มีลานกางเต็นท์ที่เชื่อมโยงกับบัญชีของคุณ
              หากคุณต้องการยืนยันว่าเป็นเจ้าของลานกรุณาติดต่อทีมงานที่เพจ{" "}
              <Link
                href="https://www.facebook.com/profile.php?id=100080127966873"
                target="_blank"
                className="text-primary underline"
              >
                แคมป์หมูแคมป์หมี
              </Link>{" "}
              เพื่อยืนยันตัวตน
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => {
            const thumbnailUrl = post.thumbnail
              ? urlFor(post.thumbnail)?.width(400).height(300).url()
              : null;

            return (
              <Card
                key={post._id}
                className="overflow-hidden hover:shadow-md transition-shadow pt-0 border-0"
              >
                <div className="relative aspect-video bg-muted">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="gap-1.5">
                  <CardTitle className="text-lg line-clamp-1">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="flex items-start gap-1">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      {post.address?.subdistrict &&
                        `${post.address.subdistrict} `}
                      {post.address?.district && `${post.address.district} `}
                      {post.address?.province && `จ.${post.address.province}`}
                    </span>
                  </CardDescription>
                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                    {post.imageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {post.imageCount}
                      </span>
                    )}
                    {post.videoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {post.videoCount}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleEdit(post._id)}
                    className="w-full"
                    variant="default"
                  >
                    แก้ไขข้อมูล
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
