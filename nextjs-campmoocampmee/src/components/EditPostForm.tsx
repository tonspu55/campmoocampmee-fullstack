'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import Image from 'next/image'

interface ThumbnailData {
  _type: 'image'
  asset?: { _ref?: string; _id?: string; url?: string }
}

interface GalleryImageItem {
  _key?: string
  _type: 'image'
  asset?: { _ref?: string; _id?: string; url?: string }
  category?: string
  alt?: string
}

interface PortableTextBlock {
  _type: string
  _key?: string
  style?: string
  children?: Array<{
    _type: string
    _key?: string
    text: string
    marks?: string[]
  }>
  markDefs?: unknown[]
}

interface PostData {
  _id: string
  title: string
  thumbnail?: ThumbnailData
  gallery?: GalleryImageItem[]
  address: {
    region?: string
    province?: string
    district?: string
    subdistrict?: string
  }
  body: PortableTextBlock[]
  socialContactLinks: {
    facebook?: string
    tiktok?: string
    line?: string
    instagram?: string
    googleMap?: string
    phone?: string
  }
  otherBenefits: {
    checkIn?: string
    checkOut?: string
    cabin?: string
    nature?: string
    noNoise?: string
    petFriendly?: string
    wifi?: string
    priceOfStay?: string
    food?: string
  }
}

export default function EditPostForm({ postId }: { postId: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState<PostData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Thumbnail states
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  // Gallery states
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([])
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([])
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null)
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Form states
  const [body, setBody] = useState<PortableTextBlock[]>([])

  const [address, setAddress] = useState({
    province: '',
    district: '',
    subdistrict: '',
  })

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    tiktok: '',
    line: '',
    instagram: '',
    googleMap: '',
    phone: '',
  })

  const [benefits, setBenefits] = useState({
    checkIn: '',
    checkOut: '',
    cabin: '',
    nature: '',
    noNoise: '',
    petFriendly: '',
    wifi: '',
    priceOfStay: '',
    food: '',
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin?callbackUrl=/landowner')
      return
    }

    fetchPost()
  }, [session, status, router, postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/landowner/posts/${postId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      const data = await response.json()
      setPost(data.post)

      // Set form data
      if (data.post.body) {
        setBody(data.post.body)
      }

      if (data.post.address) {
        setAddress({
          province: data.post.address.province || '',
          district: data.post.address.district || '',
          subdistrict: data.post.address.subdistrict || '',
        })
      }

      if (data.post.socialContactLinks) {
        setSocialLinks({
          facebook: data.post.socialContactLinks.facebook || '',
          tiktok: data.post.socialContactLinks.tiktok || '',
          line: data.post.socialContactLinks.line || '',
          instagram: data.post.socialContactLinks.instagram || '',
          googleMap: data.post.socialContactLinks.googleMap || '',
          phone: data.post.socialContactLinks.phone || '',
        })
      }

      if (data.post.otherBenefits) {
        setBenefits({
          checkIn: data.post.otherBenefits.checkIn || '',
          checkOut: data.post.otherBenefits.checkOut || '',
          cabin: data.post.otherBenefits.cabin || '',
          nature: data.post.otherBenefits.nature || '',
          noNoise: data.post.otherBenefits.noNoise || '',
          petFriendly: data.post.otherBenefits.petFriendly || '',
          wifi: data.post.otherBenefits.wifi || '',
          priceOfStay: data.post.otherBenefits.priceOfStay || '',
          food: data.post.otherBenefits.food || '',
        })
      }

      // Set thumbnail preview
      if (data.post.thumbnail?.asset?.url) {
        setThumbnailPreview(data.post.thumbnail.asset.url)
      }

      // Set gallery data
      if (data.post.gallery && data.post.gallery.length > 0) {
        setGalleryImages(data.post.gallery)
        setGalleryPreviews(data.post.gallery.map((img: GalleryImageItem) => img.asset?.url || null))
        setGalleryFiles(new Array(data.post.gallery.length).fill(null))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }

      setThumbnailFile(file)
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
    }
  }

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  // Handle gallery image file selection (replace existing image)
  const handleGalleryImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }

      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 1MB')
        return
      }

      // Update gallery files array
      const newGalleryFiles = [...galleryFiles]
      newGalleryFiles[index] = file
      setGalleryFiles(newGalleryFiles)

      // Update preview
      const previewUrl = URL.createObjectURL(file)
      const newPreviews = [...galleryPreviews]
      newPreviews[index] = previewUrl
      setGalleryPreviews(newPreviews)
    }
  }

  // Cancel gallery image replacement
  const handleCancelGalleryReplace = (index: number) => {
    // Reset to original image
    const newGalleryFiles = [...galleryFiles]
    newGalleryFiles[index] = null
    setGalleryFiles(newGalleryFiles)

    // Reset preview to original
    const newPreviews = [...galleryPreviews]
    newPreviews[index] = galleryImages[index]?.asset?.url || null
    setGalleryPreviews(newPreviews)

    // Reset input
    if (galleryInputRefs.current[index]) {
      galleryInputRefs.current[index]!.value = ''
    }
  }

  // Upload single gallery image
  const uploadGalleryImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/landowner/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('อัพโหลดรูปภาพไม่สำเร็จ')
      }

      const data = await response.json()
      return data.assetId
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  // Upload thumbnail to Sanity
  const uploadThumbnail = async (): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null> => {
    if (!thumbnailFile) return null

    try {
      setUploadingThumbnail(true)

      // Create FormData and upload to Sanity
      const formData = new FormData()
      formData.append('file', thumbnailFile)

      const response = await fetch('/api/landowner/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('อัพโหลดรูปภาพไม่สำเร็จ')
      }

      const data = await response.json()
      return {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: data.assetId,
        },
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('อัพโหลดรูปภาพไม่สำเร็จ')
      return null
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Upload new thumbnail if selected
      let thumbnailData = undefined
      if (thumbnailFile) {
        thumbnailData = await uploadThumbnail()
        if (!thumbnailData) {
          setSaving(false)
          return
        }
      }

      // Upload new gallery images (replace existing ones)
      let updatedGallery = undefined
      const hasGalleryChanges = galleryFiles.some(file => file !== null)

      if (hasGalleryChanges) {
        updatedGallery = await Promise.all(
          galleryImages.map(async (img, index) => {
            const file = galleryFiles[index]
            if (file) {
              // Upload new image
              setUploadingGalleryIndex(index)
              const assetId = await uploadGalleryImage(file)
              setUploadingGalleryIndex(null)

              if (!assetId) {
                throw new Error(`อัพโหลดรูปภาพตำแหน่งที่ ${index + 1} ไม่สำเร็จ`)
              }

              return {
                _key: img._key || `image-${Date.now()}-${index}`,
                _type: 'image' as const,
                asset: {
                  _type: 'reference' as const,
                  _ref: assetId,
                },
                category: img.category || 'วิว',
                alt: img.alt || '',
              }
            }
            // Keep original image
            return {
              _key: img._key || `image-${Date.now()}-${index}`,
              _type: 'image' as const,
              asset: {
                _type: 'reference' as const,
                _ref: img.asset?._id || img.asset?._ref || '',
              },
              category: img.category || 'วิว',
              alt: img.alt || '',
            }
          })
        )
      }

      const response = await fetch(`/api/landowner/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(thumbnailData && { thumbnail: thumbnailData }),
          ...(updatedGallery && { gallery: updatedGallery }),
          body,
          address,
          socialContactLinks: socialLinks,
          otherBenefits: benefits,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      toast.success('บันทึกข้อมูลสำเร็จ')
      router.push('/landowner')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto max-w-4xl px-2 ">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className='border-0'>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto max-w-4xl px-2 ">
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>{error || 'ไม่พบข้อมูล'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/landowner')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-2 ">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.push('/landowner')}
          size="icon"
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl  font-bold">แก้ไขข้อมูล</h1>
          <p className="text-muted-foreground">{post.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Thumbnail Section */}
        <Card className='border-0'>
          <CardHeader>
            <CardTitle>รูปปก (Thumbnail)</CardTitle>
            <CardDescription>รูปภาพหลักที่จะแสดงในหน้าแรก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thumbnailPreview ? (
                <div className="relative w-full max-w-50">
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {thumbnailFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ไฟล์ใหม่: {thumbnailFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full max-w-50 aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG สูงสุด 5MB</p>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              {thumbnailPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  เปลี่ยนรูปภาพ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <Card className='border-0'>
            <CardHeader>
              <CardTitle>รูปภาพใน Gallery ({galleryImages.length} รูป)</CardTitle>
              <CardDescription>
                คลิกที่รูปเพื่อเปลี่ยนรูปใหม่ (ขนาดไม่เกิน 1MB ต่อรูป) - ไม่สามารถเพิ่มหรือลบรูปได้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img, index) => (
                  <div key={img._key || index} className="relative">
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      {galleryPreviews[index] ? (
                        <Image
                          src={galleryPreviews[index]!}
                          alt={img.alt || `Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {uploadingGalleryIndex === index && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-sm">กำลังอัพโหลด...</div>
                        </div>
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {img.category || 'วิว'}
                    </div>

                    {/* Image number */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {galleryFiles[index] ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleCancelGalleryReplace(index)}
                          title="ยกเลิกการเปลี่ยนรูป"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => galleryInputRefs.current[index]?.click()}
                          title="เปลี่ยนรูป"
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={(el) => { galleryInputRefs.current[index] = el }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGalleryImageChange(index, e)}
                      className="hidden"
                    />

                    {/* Show "changed" indicator */}
                    {galleryFiles[index] && (
                      <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        รูปใหม่
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Body Section */}
        <Card className='border-0'>
          <CardHeader>
            <CardTitle>เนื้อหา</CardTitle>
            <CardDescription>เขียนรายละเอียดเกี่ยวกับลานกางเต็นท์</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={body}
              onChange={setBody}
            />
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card className='border-0'>
          <CardHeader>
            <CardTitle>ที่อยู่</CardTitle>
            <CardDescription>แก้ไขข้อมูลที่อยู่ของลาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province">จังหวัด</Label>
              <Input
                id="province"
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                placeholder="เช่น เชียงใหม่"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">อำเภอ</Label>
              <Input
                id="district"
                value={address.district}
                onChange={(e) => setAddress({ ...address, district: e.target.value })}
                placeholder="เช่น เมืองเชียงใหม่"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdistrict">ตำบล</Label>
              <Input
                id="subdistrict"
                value={address.subdistrict}
                onChange={(e) => setAddress({ ...address, subdistrict: e.target.value })}
                placeholder="เช่น สุเทพ"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Contact Links Section */}
        <Card className='border-0'>
          <CardHeader>
            <CardTitle>ช่องทางติดต่อ</CardTitle>
            <CardDescription>แก้ไขลิงก์โซเชียลมีเดียและเบอร์โทรติดต่อ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line">Line</Label>
              <Input
                id="line"
                type="url"
                value={socialLinks.line}
                onChange={(e) => setSocialLinks({ ...socialLinks, line: e.target.value })}
                placeholder="https://line.me/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                type="url"
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="https://tiktok.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleMap">Google Map</Label>
              <Input
                disabled
                id="googleMap"
                type="url"
                value={socialLinks.googleMap}
                onChange={(e) => setSocialLinks({ ...socialLinks, googleMap: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                value={socialLinks.phone}
                onChange={(e) => setSocialLinks({ ...socialLinks, phone: e.target.value })}
                placeholder="0812345678"
              />
            </div>
          </CardContent>
        </Card>

        {/* Other Benefits Section */}
        <Card className='border-0'>
          <CardHeader>
            <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
            <CardDescription>แก้ไขข้อมูลสิ่งอำนวยความสะดวกและเงื่อนไข</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">เวลา Check-in</Label>
                <Input
                  id="checkIn"
                  value={benefits.checkIn}
                  onChange={(e) => setBenefits({ ...benefits, checkIn: e.target.value })}
                  placeholder="เช่น 14:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">เวลา Check-out</Label>
                <Input
                  id="checkOut"
                  value={benefits.checkOut}
                  onChange={(e) => setBenefits({ ...benefits, checkOut: e.target.value })}
                  placeholder="เช่น 12:00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceOfStay">ราคาที่พัก</Label>
              <Input
                id="priceOfStay"
                value={benefits.priceOfStay}
                onChange={(e) => setBenefits({ ...benefits, priceOfStay: e.target.value })}
                placeholder="เช่น 300-500 บาท/คืน"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cabin">อุปกรณ์ให้เช่า</Label>
              <Input
                id="cabin"
                value={benefits.cabin}
                onChange={(e) => setBenefits({ ...benefits, cabin: e.target.value })}
                placeholder="เช่น เครื่องนอน พัดลม เต็นท์"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi">WiFi</Label>
              <Input
                id="wifi"
                value={benefits.wifi}
                onChange={(e) => setBenefits({ ...benefits, wifi: e.target.value })}
                placeholder="เช่น มี (ฟรี)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="food">อาหาร</Label>
              <Input
                id="food"
                value={benefits.food}
                onChange={(e) => setBenefits({ ...benefits, food: e.target.value })}
                placeholder="เช่น มีบริการสั่งอาหาร"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="petFriendly">สัตว์เลี้ยง</Label>
              <Input
                id="petFriendly"
                value={benefits.petFriendly}
                onChange={(e) => setBenefits({ ...benefits, petFriendly: e.target.value })}
                placeholder="เช่น อนุญาตให้นำสัตว์เลี้ยงเข้าพัก"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nature">วิว</Label>
              <Textarea
                id="nature"
                value={benefits.nature}
                onChange={(e) => setBenefits({ ...benefits, nature: e.target.value })}
                placeholder="เช่น วิวภูเขา ป่าไม้"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noNoise">เวลาที่ต้องงดส่งเสียงดัง</Label>
              <Input
                id="noNoise"
                value={benefits.noNoise}
                onChange={(e) => setBenefits({ ...benefits, noNoise: e.target.value })}
                placeholder="เช่น เงียบสงบ"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4 justify-end">
          <Button
            onClick={() => router.push('/landowner')}
            variant="outline"
            disabled={saving || uploadingThumbnail}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploadingThumbnail}
            className="gap-2"
          >

            {uploadingThumbnail ? 'กำลังอัพโหลดรูป...' : saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </div>
      </div>
    </div>
  )
}
