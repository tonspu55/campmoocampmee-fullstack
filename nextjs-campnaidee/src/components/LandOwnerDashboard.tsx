'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, ImageIcon, Video, Edit, LogOut } from 'lucide-react'
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  thumbnail: SanityImageSource
  publishedAt: string
  address: {
    province?: string
    district?: string
    subdistrict?: string
  }
  imageCount: number
  videoCount: number
}

export default function LandOwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin?callbackUrl=/landowner')
      return
    }

    fetchPosts()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/landowner/posts')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      const data = await response.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (postId: string) => {
    router.push(`/landowner/edit/${postId}`)
  }

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/landowner',
      redirect: true,
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-2 py-8">
        <Skeleton className="h-24 w-full mb-6 rounded-lg" />
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-2 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-2 py-8">
      {/* User Info Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {session?.user?.name || 'เจ้าของลาน'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h1 className="text-xl  font-bold mb-2">
          จัดการข้อมูลลานกางเต็นท์
        </h1>
        <p className="text-muted-foreground">
          คุณสามารถแก้ไขข้อมูลลานกางเต็นท์ของคุณได้ที่นี่
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูลลาน</CardTitle>
            <CardDescription>
              คุณยังไม่มีลานกางเต็นท์ที่เชื่อมโยงกับบัญชีของคุณ
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const thumbnailUrl = post.thumbnail
              ? urlFor(post.thumbnail)?.width(400).height(300).url()
              : null;

            return (
              <Card key={post._id} className="overflow-hidden hover:shadow-md transition-shadow pt-0 border-0">
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
                      {post.address?.subdistrict && `${post.address.subdistrict} `}
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
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Edit className="w-4 h-4" />
                    แก้ไขข้อมูล
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
