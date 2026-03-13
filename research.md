# CampMooCampMee — Codebase Research

> Last updated: 2026-03-14
> Website: https://www.campmoocampmee.com

---

## 1. Project Overview

**CampMooCampMee** (แคมป์หมูแคมป์หมี) คือ Web Application สำหรับค้นหาและรีวิวแคมป์ปิ้งทั่วประเทศไทย รองรับทั้ง ผู้ใช้ทั่วไป (ค้นหา / รีวิว) และ เจ้าของที่ดิน (สร้าง / จัดการข้อมูลแคมป์)

---

## 2. Tech Stack

### Frontend
| Category | Library / Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.4 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | 5.8.3 |
| Styling | Tailwind CSS 4 (CSS-first, OKLCH) | 4.1.6 |
| UI Components | shadcn/ui (New York style) + Radix UI | — |
| Icons | Lucide React | 0.525.0 |
| State | Zustand | 5.0.6 |
| Forms | React Hook Form + Zod | 7.60.0 / 3.24.4 |
| Maps | @react-google-maps/api | 2.20.8 |
| Animations | GSAP | 3.13.0 |
| Carousel | Swiper | 11.2.10 |
| Notifications | Sonner | 2.0.6 |
| Dark Mode | next-themes | 0.4.6 |
| Analytics | @vercel/analytics | 1.6.1 |
| Social Share | next-share | 0.27.0 |

### Backend / CMS
| Category | Tool | Version |
|---|---|---|
| Headless CMS | Sanity.io | v4.22.0 |
| Sanity Client | @sanity/client | 7.14.0 |
| Image Builder | @sanity/image-url | 1.1.0 |
| Next Integration | next-sanity | 9.11.0 |

### Authentication
- **NextAuth.js** 4.24.11 — Google OAuth 2.0 provider
- Session-based auth; user data stored in Sanity

### Dev Tools
- Package Manager: **pnpm**
- Linting: **ESLint** 9.39.1
- Formatter: **Prettier** 3.0.2
- Bundler: **Turbopack** (Next.js 16+)

---

## 3. Directory Structure

```
campmoocampmee-fullstack/
├── nextjs-campmoocampmee/          # Next.js Frontend App
│   ├── src/
│   │   ├── app/                    # App Router
│   │   │   ├── layout.tsx          # Root layout (providers, GA, JSON-LD)
│   │   │   ├── page.tsx            # Homepage (camps by region)
│   │   │   ├── globals.css         # Global Tailwind styles
│   │   │   ├── api/                # Route Handlers
│   │   │   │   ├── auth/[...nextauth]/     # NextAuth.js
│   │   │   │   ├── contact/               # Contact form
│   │   │   │   ├── provinces/             # Province listing
│   │   │   │   ├── reviews/               # Review CRUD
│   │   │   │   └── landowner/             # Owner endpoints
│   │   │   │       ├── posts/
│   │   │   │       ├── posts/[postId]/
│   │   │   │       └── upload/
│   │   │   ├── auth/signin/        # Sign-in page (ทั่วไป, กลับหน้าเดิม)
│   │   │   ├── auth/signin-landowner/ # Sign-in สำหรับเจ้าของลาน
│   │   │   ├── land/[slug]/        # Camp detail page
│   │   │   │   └── gallery/        # Gallery view
│   │   │   ├── search/             # Search & filter page
│   │   │   ├── landowner/          # Owner dashboard
│   │   │   │   └── edit/[postId]/  # Edit post
│   │   │   ├── contact/            # Contact page
│   │   │   ├── cookie-policy/
│   │   │   └── sitemap.xml/        # Dynamic sitemap
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui primitives
│   │   │   ├── header/             # Header, ThemeSwitcher, LogoSwitcher
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── AuthenLandOwner.tsx
│   │   │   ├── CampMap.tsx
│   │   │   ├── CampThumbnail.tsx
│   │   │   ├── EditPostForm.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   ├── SearchBox.tsx
│   │   │   ├── SearchCampGrid.tsx
│   │   │   ├── SearchMapWrapper.tsx
│   │   │   └── ... (35+ components)
│   │   ├── lib/
│   │   │   ├── utils.ts            # Tailwind cn() helper
│   │   │   ├── store.ts            # Zustand stores
│   │   │   ├── regions.ts          # Thai regions data
│   │   │   ├── provinces.ts        # Thai provinces mapping
│   │   │   └── videoUtils.ts       # Video utilities
│   │   ├── sanity/
│   │   │   └── client.ts           # Sanity client config
│   │   └── types/
│   │       └── gallery.ts          # TypeScript interfaces
│   ├── public/assets/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── components.json             # shadcn/ui config
│   ├── .env.development
│   ├── .env.production
│   └── DESIGN_SYSTEM.md
│
└── studio-campmoocampmee/          # Sanity CMS Studio
    ├── schemaTypes/
    │   ├── postType.ts             # Camp listing schema
    │   ├── userType.ts             # User schema
    │   ├── reviewType.ts           # Review schema
    │   ├── submitContactType.ts    # Contact submission schema
    │   └── index.ts
    ├── sanity.config.ts
    └── sanity.cli.ts
```

---

## 4. Pages & Routes

### Public
| Route | Description |
|---|---|
| `/` | Homepage — camps แนะนำแยกตามภูมิภาค |
| `/search` | ค้นหา/กรอง camps (`force-dynamic`) |
| `/land/[slug]` | หน้ารายละเอียดแคมป์ (ISR 300s) |
| `/land/[slug]/gallery` | Gallery ภาพ/วิดีโอ |
| `/contact` | ฟอร์มติดต่อสำหรับเจ้าของที่ดิน |
| `/auth/signin` | Sign-in ทั่วไป (กลับหน้าเดิมตาม callbackUrl) |
| `/auth/signin-landowner` | Sign-in สำหรับเจ้าของลานกางเต็นท์ (redirect → /landowner) |
| `/cookie-policy` | นโยบาย Cookie |
| `/sitemap.xml` | Dynamic XML sitemap (cache 24h) |

### Protected (Land Owner)
| Route | Description |
|---|---|
| `/landowner` | Dashboard รายการแคมป์ของเจ้าของ |
| `/landowner/edit/[postId]` | แก้ไขข้อมูลแคมป์ |

---

## 5. API Endpoints

### Authentication
```
GET/POST  /api/auth/[...nextauth]    NextAuth.js handler
```

### Public
```
GET   /api/provinces                 รายชื่อจังหวัดพร้อมจำนวนแคมป์
GET   /api/reviews?postId=...        ดึงรีวิวที่อนุมัติแล้วของแคมป์
POST  /api/reviews                   ส่งรีวิวใหม่
POST  /api/contact                   ส่งฟอร์มติดต่อ
```

### Protected (Land Owner)
```
GET    /api/landowner/posts              ดึงรายการ posts ของเจ้าของ
GET    /api/landowner/posts/[postId]     ดึง post เฉพาะรายการ
PATCH  /api/landowner/posts/[postId]     อัปเดต post
POST   /api/landowner/upload             อัปโหลดภาพไปยัง Sanity
```

---

## 6. Database — Sanity.io Schemas

### Post (Camp Listing)
```typescript
{
  _type: "post"
  providerId: string           // Google ID ของเจ้าของ
  title: string
  slug: { current: string }
  publishedAt: datetime
  tags: ["recommend" | "new" | "nearBangkok"]
  thumbnail: Image
  address: {
    region: string             // "northern" | "central" | ...
    province: string
    district: string
    subdistrict: string
  }
  location: { lat: number; lng: number }
  gallery: Image[]             // category: "วิว" | "ที่พัก" | "กิจกรรม" | "ห้องน้ำ"
  videos: { url: string; platform: "youtube"; category: string }[]
  body: BlockContent[]         // Rich text
  socialContactLinks: {
    facebook? tiktok? line? instagram? googleMap? phone?
  }
  otherBenefits: {
    checkIn? checkOut? cabin? nature? noNoise?
    petFriendly? wifi? priceOfStay? food?
  }
}
```

### User
```typescript
{
  _type: "user"
  name: string
  email: string                // unique
  image: url
  provider: "google"
  providerId: string
  createdAt: datetime
}
```

### Review
```typescript
{
  _type: "review"
  post: reference              // -> Post
  user: reference              // -> User
  rating: 1-5
  comment: string              // 10-1000 chars
  status: "pending" | "approved" | "rejected"
  createdAt: datetime
}
```

### Submit Contact
```typescript
{
  _type: "submitContact"
  campName: string
  telNumber: string
  lineId: string
  submittedAt: datetime
  status: "pending" | "contacting" | "completed"
}
```

**Sanity Config:**

- Project ID: `tqzf3jx1`
- Datasets: `develop` (dev) / `production` (prod) — production ตั้งเป็น **public**
- API Version: `2024-01-01`

---

## 7. Authentication Flow

```text
User → Google OAuth 2.0
  → NextAuth.js signIn callback
    → ค้นหา / สร้าง User document ใน Sanity
    → เก็บ providerId, name, email, image
  → Session มี: provider, providerId
  → Redirect ตาม callbackUrl (default: /)

Sign-in แยก 2 flow:
  - /auth/signin          → user ทั่วไป → กลับหน้าเดิม (callbackUrl)
  - /auth/signin-landowner → เจ้าของลาน → redirect ไป /landowner
```

**Authorization:**
- Protected routes ใช้ `getServerSession()`
- Endpoints ตรวจ `providerId` ก่อนแก้ไขข้อมูล
- เจ้าของแก้ไขได้เฉพาะ post ของตัวเอง

---

## 8. State Management (Zustand)

```typescript
// src/lib/store.ts
useScrollStore()        // ตำแหน่ง scroll สำหรับ header
useGalleryStore()       // index ภาพที่เลือก (lightbox)
useLandOwnerStore()     // รายการ posts + สถานะ auth ของเจ้าของ
```

---

## 9. External Services

| Service | Purpose | Key |
|---|---|---|
| Google OAuth 2.0 | Authentication | `GOOGLE_CLIENT_ID/SECRET` |
| Google Maps API | แผนที่บนหน้า search + detail | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Sanity.io | CMS + Image CDN | `SANITY_API_TOKEN` |
| Google Analytics | Tracking (GA ID: G-DR8BCC2VX9) | ฝังใน layout.tsx |
| Vercel | Hosting + Edge CDN + Analytics | — |

---

## 10. Environment Variables

| Variable | Public | Purpose |
|---|---|---|
| `SANITY_API_TOKEN` | No | Write access to Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | `develop` / `production` |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical URL |
| `NEXTAUTH_URL` | No | OAuth callback URL |
| `NEXTAUTH_SECRET` | No | JWT encryption |
| `GOOGLE_CLIENT_ID` | Yes | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | OAuth secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Maps API |

---

## 11. Caching & Performance

### Sanity Client Architecture

`src/sanity/client.ts` แยก client เป็น 2 ตัว:

```typescript
// readClient — อ่านอย่างเดียว, ใช้ Sanity CDN (dataset ต้องเป็น public)
export const readClient = createClient({ ...config, useCdn: true });

// client — เขียน/mutations, ต้องการ token
export const client = createClient({ ...config, useCdn: false, token: process.env.SANITY_API_TOKEN });
```

**ไฟล์ที่ใช้ `readClient`** (read-only):
`page.tsx`, `search/page.tsx`, `land/[slug]/page.tsx`, `land/[slug]/gallery/page.tsx`,
`Footer.tsx`, `CampThumbnail.tsx`, `SearchCampGrid.tsx`, `api/provinces/route.ts`, `sitemap.xml/route.ts`

**ไฟล์ที่ใช้ `client`** (write):
`api/reviews/route.ts`, `api/contact/route.ts`, `api/landowner/*`, `api/auth/*`, `LandOwnerDashboard.tsx`

### ISR Revalidation

| Page | Strategy | TTL |
|---|---|---|
| `/` | ISR | 3600s (1 ชม.) |
| `/land/[slug]` | ISR | 300s |
| `/land/[slug]/gallery` | ISR | 300s |
| `/search` | ISR | 300s |
| `/api/provinces` | ISR | 3600s (1 ชม.) |
| `/sitemap.xml` | Cache-Control | 86400s (24h) |
| Footer camp count | ISR | 3600s (1 ชม.) |

**อื่น ๆ:**

- `CampMap` โหลดแบบ dynamic import (client-only)
- Sanity CDN สำหรับรูปภาพ (`useCdn: true` + dataset public)
- Next.js Image component + remote patterns (`cdn.sanity.io`, `lh3.googleusercontent.com`)

---

## 12. Design System

- **Primary color:** `oklch(0.419 0.0707 186.7274)` — Teal `#085953`
- **Font:** Noto Sans Thai (Google Fonts) — รองรับภาษาไทย
- **UI Kit:** shadcn/ui New York style (Radix UI primitives)
- **Animation:** GSAP + Tailwind built-in
- **Color Space:** OKLCH (Tailwind CSS 4)
- **Theme:** Light / Dark mode (next-themes)

---

## 13. Scripts

### Next.js App
```bash
pnpm dev     # Dev server
pnpm build   # Production build (Turbopack)
pnpm start   # Run production server
pnpm lint    # ESLint
```

### Sanity Studio
```bash
pnpm dev      # Studio dev server (:3333)
pnpm build    # Build studio
pnpm deploy   # Deploy studio to Sanity.io
```

---

## 14. Business Logic Summary

### Camp Discovery
1. ค้นหาตามภูมิภาค (6 ภูมิภาคไทย) หรือจังหวัด
2. กรองด้วย tags: `recommend`, `new`, `nearBangkok`
3. ดูบนแผนที่ (Google Maps) หรือ grid
4. Pagination สำหรับผลลัพธ์จำนวนมาก

### Review System
- Rating 1-5 ดาว + comment 10-1000 ตัวอักษร
- Moderation: `pending → approved / rejected`
- คำนวณคะแนนเฉลี่ยแสดงในหน้า detail

### Land Owner Workflow
1. Sign in ด้วย Google
2. กรอกข้อมูลแคมป์ + อัปโหลดภาพ (≤1MB/ภาพ)
3. เพิ่มวิดีโอ YouTube + ข้อมูลสิ่งอำนวยความสะดวก
4. ดูและจัดการ listings ใน dashboard

### Contact Management
- ผู้สนใจส่ง contact form
- Admin ติดตามสถานะ: `pending → contacting → completed`

---

## 15. SEO

- Dynamic sitemap (`/sitemap.xml`)
- JSON-LD Structured Data: Organization + WebSite + SearchAction
- Metadata generation ต่อหน้า
- Canonical URLs ผ่าน `metadataBase`
- Open Graph + Twitter Card สำหรับ social sharing

---

## 16. ระบบจองลานกางเต็นท์ (Booking System) — แผนพัฒนา

### Booking Flow

```text
1. ผู้ใช้ดูหน้าแคมป์ → กดปุ่ม "จอง"
2. เลือกวันเช็คอิน/เช็คเอาท์, จำนวนผู้เข้าพัก
3. กรอกเบอร์โทร → ระบบส่ง OTP (ThaiBulkSMS) → ยืนยัน OTP
4. แสดงสรุปการจอง + ข้อมูลบัญชี/PromptPay ของเจ้าของลาน
5. ผู้จองโอนเงินเอง → แนบรูปสลิป
6. ระบบส่งสลิปไป SlipOK API ตรวจสอบอัตโนมัติ
   ✅ สลิปถูกต้อง + ยอดเงินตรง → สร้าง booking + ส่ง SMS หมายเลขจอง
   ❌ สลิปไม่ผ่าน → แจ้งผู้จอง / fallback ให้เจ้าของลาน approve manual
```

### Decisions

- **Auth:** จองได้ทั้ง guest (เบอร์โทร+OTP) และ Google login
- **SMS/OTP:** ThaiBulkSMS
- **Payment:** ผู้จองโอนเงินเอง → แนบสลิป → SlipOK ตรวจสอบอัตโนมัติ
- **Approval:** auto-confirm หลังสลิปถูกต้อง, fallback เจ้าของลาน approve manual
- **Database:** Sanity CMS (เดิม)
- **บัญชีรับเงิน:** เจ้าของลานตั้งค่าเลขบัญชี/PromptPay ใน post schema

### External Services เพิ่มเติม

| Service | Purpose | Env Variables |
| --- | --- | --- |
| ThaiBulkSMS | ส่ง OTP + SMS ยืนยันการจอง | `THAIBULKSMS_API_KEY`, `THAIBULKSMS_API_SECRET` |
| SlipOK | ตรวจสอบสลิปโอนเงินอัตโนมัติ | `SLIPOK_API_KEY`, `SLIPOK_BRANCH_ID` |

### Sanity Schemas ใหม่

#### Booking

```typescript
{
  _type: "booking"
  bookingNumber: string           // CMC-YYYYMMDD-XXXX (unique)
  post: reference                 // → Post
  guestName: string
  guestPhone: string
  guestEmail?: string             // ถ้า login Google
  userId?: reference              // → User (ถ้า login Google)
  checkIn: date
  checkOut: date
  guests: number
  totalAmount: number
  slipImage: image
  slipVerification: {
    verified: boolean
    transRef?: string             // เลขอ้างอิงจาก SlipOK
    amount?: number
    verifiedAt?: datetime
  }
  status: "pending_payment" | "pending_verify" | "confirmed" | "rejected" | "cancelled"
  createdAt: datetime
  confirmedAt?: datetime
}
```

#### OTP

```typescript
{
  _type: "otp"
  phone: string
  code: string                    // hashed (bcrypt)
  expiresAt: datetime             // 5 นาที
  verified: boolean
  attempts: number                // max 3
  createdAt: datetime
}
```

#### เพิ่ม field ใน Post

```typescript
paymentInfo: {
  bankName: string
  accountNumber: string
  accountName: string
  promptPayId: string
}
```

### API Endpoints ใหม่

```text
POST  /api/booking/otp/send                  ส่ง OTP ไปเบอร์โทร
POST  /api/booking/otp/verify                ตรวจสอบ OTP
POST  /api/booking/create                    สร้าง booking (pending_payment)
POST  /api/booking/upload-slip               อัพโหลดสลิป + ตรวจสอบ SlipOK
GET   /api/booking/[bookingNumber]           ดูสถานะการจอง
PATCH /api/booking/[bookingNumber]           เจ้าของลาน approve/reject

GET   /api/landowner/bookings                รายการจองทั้งหมดของลาน
PATCH /api/landowner/bookings/[bookingNumber] approve/reject สลิป (manual)
```

### Pages ใหม่

| Route | Description |
| --- | --- |
| `/land/[slug]/booking` | หน้าจอง (multi-step form) |
| `/booking/[bookingNumber]` | ดูสถานะการจอง |
| `/landowner/bookings` | Dashboard จัดการ booking |

### Components ใหม่

```text
components/booking/
  BookingForm.tsx        — multi-step form หลัก
  DatePicker.tsx         — เลือกวัน check-in/check-out
  OtpInput.tsx           — กรอก OTP 6 หลัก
  BookingSummary.tsx     — สรุปการจอง + ข้อมูลบัญชี
  SlipUpload.tsx         — อัพโหลดรูปสลิป
  BookingStatus.tsx      — แสดงสถานะการจอง
  BookingCard.tsx        — card ในหน้า landowner dashboard
```

### Packages เพิ่มเติม

```text
bcryptjs               — hash OTP code
```

### Security

- OTP hash ด้วย bcrypt ก่อนเก็บ
- Rate limit: ส่ง OTP ≤ 5 ครั้ง/เบอร์/ชม.
- Slip upload: จำกัด 5MB, เฉพาะ image/*
- ป้องกันสลิปซ้ำ (transRef duplicate check)
- SlipOK API key เก็บ server-side only
