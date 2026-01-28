# Design System Guide - CampMooCampMee

> เอกสารนี้อธิบายระบบออกแบบ (Design System) ของเว็บไซต์ CampMooCampMee สำหรับใช้เป็นแนวทางในการพัฒนา UI/UX ให้มีความสอดคล้องกันทั้งโปรเจกต์

## 📚 Overview

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS first configuration)
- **UI Library**: shadcn/ui (New York style)
- **Icon Library**: Lucide React
- **Animation**: GSAP
- **Toast Notifications**: Sonner
- **Font**: Noto Sans Thai (Thai language support)

---

## 🎨 Color System

โปรเจกต์ใช้ **OKLCH color space** เพื่อความแม่นยำในการจัดการสีและรองรับทั้ง Light และ Dark mode

### Primary Colors

```css
/* Light Mode */
--primary: oklch(0.419 0.0707 186.7274) /* สีเขียวหลัก #085953 */
  --primary-foreground: oklch(1 0 0) /* ข้อความบน primary (ขาว) */
  /* Dark Mode */ --primary: oklch(0.419 0.0707 186.7274)
  /* เหมือน Light mode */ --primary-foreground: oklch(1 0 0)
  /* ข้อความบน primary (ขาว) */;
```

### Secondary Colors

```css
/* Light Mode */
--secondary: oklch(0.97 0 0) /* สีเทาอ่อน */
  --secondary-foreground: oklch(0.205 0 0) /* ข้อความบน secondary (เทาเข้ม) */
  /* Dark Mode */ --secondary: oklch(0.269 0 0) /* สีเทาเข้ม */
  --secondary-foreground: oklch(0.985 0 0) /* ข้อความบน secondary (ขาว) */;
```

### Semantic Colors

```css
/* Light Mode */
--background: oklch(1 0 0) /* พื้นหลังหลัก (ขาว) */
  --foreground: oklch(0.145 0 0) /* ข้อความหลัก (เทาดำ) */
  --destructive: oklch(0.577 0.245 27.325) /* สีแดง (สำหรับการลบ/ยกเลิก) */
  --muted: oklch(0.97 0 0) /* สีพื้นหลังรอง */
  --muted-foreground: oklch(0.556 0 0) /* ข้อความรอง */
  --accent: oklch(0.97 0 0) /* สี Accent */ --border: oklch(0.922 0 0)
  /* สีขอบ */ --input: oklch(0.922 0 0) /* สีขอบ Input */
  --ring: oklch(0.708 0 0) /* สี Focus ring */;
```

### Custom Colors

```css
--description: oklch(0.985 0 0) /* สีสำหรับคำอธิบาย */;
```

### Hard-coded Colors (ควรหลีกเลี่ยง)

⚠️ **พบการใช้สี hard-code ในบางจุด ควรแปลงเป็น CSS variables:**

- `bg-[#F39C12]` - สีส้มใน AuthenLandOwner (ควรสร้าง `--warning` variable)
- `border-[#085953]` - สีเขียว primary ใน Header (ควรใช้ `border-primary`)
- `text-[#085953]` - สีเขียว primary ใน Header (ควรใช้ `text-primary`)
- `text-[#000000]` - สีดำใน SearchBox (ควรใช้ `text-foreground`)

---

## 📐 Spacing & Layout

### Container

```css
.container {
  max-width: 1152px; /* 6xl: max-w-6xl */
  margin: 0 auto;
  padding: 0 0.5rem; /* px-2 */
}
```

### Common Spacing Patterns

- **Small Gap**: `gap-2` (0.5rem / 8px)
- **Medium Gap**: `gap-4` (1rem / 16px)
- **Large Gap**: `gap-6` (1.5rem / 24px)
- **Card Padding**: `p-4` หรือ `py-6` (มาตรฐานของ Card component)

---

## 🔤 Typography

### Font Families

```css
--font-sans:
  ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
  "Segoe UI Emoji";

--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;

--font-mono:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  "Courier New", monospace;
```

### Font Sizes

```tsx
/* Headings */
text-xl        /* 1.25rem / 20px - Mobile H1 */
text-2xl       /* 1.5rem / 24px - Section Headings */
text-4xl       /* 2.25rem / 36px - Desktop H1 */

/* Body Text */
text-sm        /* 0.875rem / 14px - Small text, descriptions */
text-base      /* 1rem / 16px - Default body text */
text-md        /* Medium size */
text-normal    /* Normal size */
```

### Font Weights

- `font-normal` - 400 (ข้อความธรรมดา)
- `font-medium` - 500 (ปุ่ม, label)
- `font-semibold` - 600 (หัวข้อรอง)
- `font-bold` - 700 (หัวข้อหลัก)

### Text Utilities

- `.line-clamp-1` - จำกัดข้อความ 1 บรรทัด
- `.text-description` - ใช้สี description variable
- `.whitespace-nowrap` - ข้อความไม่ตัดบรรทัด

---

## 🎯 Border Radius

```css
--radius: 0.625rem; /* 10px - Base radius */

/* Variants */
--radius-sm: calc(var(--radius) - 4px); /* 6px */
--radius-md: calc(var(--radius) - 2px); /* 8px */
--radius-lg: var(--radius); /* 10px */
--radius-xl: calc(var(--radius) + 4px); /* 14px */
```

### Usage Examples

```tsx
rounded-md        /* 8px - Default for buttons, inputs */
rounded-lg        /* 10px - Cards */
rounded-xl        /* 12px - Large cards */
rounded-[20px]    /* 20px - Image thumbnails */
rounded-full      /* 50% - Icon buttons, avatars */
```

---

## 🌓 Shadows

```css
--shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-sm:
  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
--shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
--shadow-md:
  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1);
--shadow-lg:
  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1);
--shadow-xl:
  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1);
--shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
```

### Common Usage

- `shadow-xs` - ปุ่ม, input fields
- `shadow-sm` - Cards, popovers
- `shadow-md` - Elevated cards
- `shadow-lg` - Modals

---

## 🔲 Components

### Button Component

**Path**: `src/components/ui/button.tsx`

#### Variants

```tsx
/* Primary - สีเขียวหลัก */
<Button variant="default">ปุ่มหลัก</Button>

/* Destructive - สีแดง สำหรับการลบ/ยกเลิก */
<Button variant="destructive">ลบ</Button>

/* Outline - มีขอบ พื้นหลังโปร่งใส */
<Button variant="outline">ปุ่มรอง</Button>

/* Secondary - สีเทา */
<Button variant="secondary">รอง</Button>

/* Ghost - ไม่มีพื้นหลัง */
<Button variant="ghost">Ghost</Button>

/* Link - แสดงเป็นลิงก์ */
<Button variant="link">ลิงก์</Button>
```

#### Sizes

```tsx
<Button size="sm">เล็ก</Button>       /* h-8 px-3 */
<Button size="default">ปกติ</Button>  /* h-9 px-4 (default) */
<Button size="lg">ใหญ่</Button>       /* h-10 px-6 */
<Button size="icon">Icon</Button>     /* size-9 (square) */
```

#### Special Patterns

```tsx
/* Round icon button */
<Button className="h-9 w-9 rounded-full" variant="default">
  <Share />
</Button>

/* Button with icon */
<Button className="gap-2">
  <LogOut size={16} />
  <span>ออกจากระบบ</span>
</Button>

/* Cursor pointer (required for interactive elements) */
<Button className="cursor-pointer">คลิก</Button>
```

#### States

- **Focus**: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Disabled**: `disabled:opacity-50 disabled:pointer-events-none`
- **Hover**: แต่ละ variant มี hover state ต่างกัน

---

### Card Component

**Path**: `src/components/ui/card.tsx`

#### Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>ชื่อการ์ด</CardTitle>
    <CardDescription>คำอธิบาย</CardDescription>
    <CardAction>{/* ปุ่มหรือ action */}</CardAction>
  </CardHeader>
  <CardContent>{/* เนื้อหาหลัก */}</CardContent>
  <CardFooter>{/* ส่วนท้าย */}</CardFooter>
</Card>
```

#### Default Styles

```css
/* Card */
bg-card text-card-foreground rounded-xl border py-6 shadow-sm gap-6

/* CardHeader */
px-6 gap-1.5 grid

/* CardTitle */
font-semibold leading-none

/* CardDescription */
text-muted-foreground text-sm
```

#### Custom Pattern - Camp Thumbnail

```tsx
/* ไม่ใช้ Card component แต่สร้าง custom layout */
<div className="border-none p-0 flex flex-col gap-2">
  <Image className="aspect-video rounded-[20px] w-full h-[175px] lg:h-[235px] object-cover" />
  <div className="px-1">
    <h3 className="max-lg:text-sm text-md font-semibold line-clamp-1">
      {title}
    </h3>
    <InfoAddress />
  </div>
</div>
```

---

### Input Component

**Path**: `src/components/ui/input.tsx`

#### Default Styles

```tsx
<Input
  type="text"
  placeholder="กรอกข้อมูล"
  className="h-9 rounded-md border shadow-xs"
/>
```

#### States

- **Focus**: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Invalid**: `aria-invalid:border-destructive aria-invalid:ring-destructive/20`
- **Disabled**: `disabled:opacity-50 disabled:cursor-not-allowed`

#### Dark Mode Specific

```css
dark: bg-input/30; /* พื้นหลังโปร่งใสใน dark mode */
```

#### Custom Patterns

```tsx
/* Input with no border (SearchBox) */
<Input
  className="border-0 bg-white dark:text-[#000000] dark:bg-white 
                  focus-visible:outline-none focus-visible:ring-0 
                  focus-visible:ring-offset-0 rounded-r-none"
/>
```

---

### Popover Component

**Path**: `src/components/ui/popover.tsx`

#### Basic Usage

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button>เปิด</Button>
  </PopoverTrigger>
  <PopoverContent className="w-34 border-none">{/* เนื้อหา */}</PopoverContent>
</Popover>
```

#### Example - ShareToSocial

```tsx
<PopoverContent className="w-34 border-none">
  <div className="flex flex-row gap-2 justify-center">
    {/* ปุ่มแชร์ต่างๆ */}
  </div>
</PopoverContent>
```

---

### Other UI Components

#### Separator

```tsx
import { Separator } from "@/components/ui/separator";

<Separator />; /* เส้นแบ่ง */
```

#### Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-full" />; /* Loading placeholder */
```

#### Label

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">อีเมล</Label>;
```

#### Pagination

```tsx
import { Pagination } from "@/components/ui/pagination";

<Pagination currentPage={1} totalPages={10} />;
```

---

### UserInfo Component

**Path**: `src/components/UserInfo.tsx`

Component สำหรับแสดงข้อมูลผู้ใช้งาน รองรับทั้งเจ้าของลานและนักท่องเที่ยว

#### Props

| Prop                | Type                        | Default  | Description                              |
| ------------------- | --------------------------- | -------- | ---------------------------------------- |
| `user`              | `{ name?, email?, image? }` | required | ข้อมูลผู้ใช้                             |
| `isLandOwner`       | `boolean`                   | `false`  | แสดง badge เจ้าของลาน หรือ นักท่องเที่ยว |
| `onSignOut`         | `() => void`                | -        | callback เมื่อกดออกจากระบบ               |
| `showSignOutButton` | `boolean`                   | `true`   | แสดง/ซ่อนปุ่มออกจากระบบ                  |
| `className`         | `string`                    | `''`     | เพิ่ม class เพิ่มเติม                    |

#### Basic Usage

```tsx
import UserInfo from "@/components/UserInfo";

<UserInfo
  user={{
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  }}
  isLandOwner={true}
  onSignOut={() => signOut()}
/>;
```

#### Without Sign Out Button

```tsx
<UserInfo
  user={{
    name: "ชื่อผู้ใช้",
    email: "email@example.com",
    image: "/avatar.jpg",
  }}
  isLandOwner={false}
  showSignOutButton={false}
/>
```

#### Default Styles

```css
/* Container */
flex flex-row items-end justify-between gap-2

/* Avatar */
rounded-full (48x48px)

/* Name */
font-semibold text-md

/* Email */
text-sm text-muted-foreground

/* Badge - เจ้าของลาน */
inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium
bg-primary/10 text-primary rounded-full dark:bg-white

/* Badge - นักท่องเที่ยว */
inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium
bg-secondary text-secondary-foreground rounded-full
```

---

## 🖼️ Images

### Next.js Image Component

```tsx
import Image from "next/image"

/* Thumbnail Images */
<Image
  src={imageUrl}
  alt="คำอธิบาย"
  width={300}
  height={300}
  className="aspect-video rounded-[20px] w-full h-[175px] lg:h-[235px] object-cover"
/>

/* Avatar / Small Icons */
<Image
  src={user.image}
  alt={user.name}
  width={40}
  height={40}
  className="w-10 h-10 rounded-full"
/>

/* Priority Images (Above the fold) */
<Image
  priority
  src="/assets/images/facebook.png"
  alt="Facebook"
  width={30}
  height={30}
/>
```

### Image Sizing Patterns

- **Thumbnails**: `h-[175px] lg:h-[235px]`
- **Avatars**: `w-10 h-10` (40x40px)
- **Social Icons**: `30x30`
- **Aspect Ratio**: `aspect-video` (16:9)
- **Object Fit**: `object-cover` (ครอบคลุมพื้นที่)

---

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* @media (min-width: 640px) */
md: 768px   /* @media (min-width: 768px) */
lg: 1024px  /* @media (min-width: 1024px) */
xl: 1280px  /* @media (min-width: 1280px) */
2xl: 1536px /* @media (min-width: 1536px) */
```

### Common Patterns

```tsx
/* Mobile-first approach */
className = "text-xl lg:text-4xl"; /* Font size */
className = "px-2 lg:px-0"; /* Padding */
className = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; /* Grid */
className = "flex-col lg:flex-row"; /* Direction */
className = "h-[175px] lg:h-[235px]"; /* Height */
className = "w-[250px] lg:w-[350px]"; /* Width */
className = "max-lg:text-sm"; /* Max breakpoint */
className = "items-center lg:items-start"; /* Alignment */
```

### Grid Layout

```tsx
/* Product/Camp Grid */
<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

---

## 🎭 Animations

### GSAP Animations

**Library**: GSAP (GreenSock Animation Platform)

#### Example - Hero Banner Fade In

```tsx
import { gsap } from "gsap";

useEffect(() => {
  gsap.set(contentRef.current, {
    opacity: 0,
    y: -100,
  });

  gsap.to(contentRef.current, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
    delay: 0.3,
  });
}, []);
```

### CSS Animations

```css
/* Loading Spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Example usage */
<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                rounded-full animate-spin" />
```

---

## 🔔 Toast Notifications

### Sonner Setup

**Library**: Sonner
**Font**: Noto Sans Thai (configured in globals.css)

```css
[data-sonner-toast] {
  font-family: "Noto Sans Thai", sans-serif !important;
}
```

### Usage

```tsx
import { toast } from "sonner";

// Success
toast.success("คัดลอก URL เรียบร้อย", {
  duration: 2000, // 2 วินาที
});

// Error
toast.error("เกิดข้อผิดพลาด", {
  duration: 3000,
});

// Info
toast.info("ข้อมูลทั่วไป");

// Warning
toast.warning("คำเตือน");
```

### Toast Guidelines

- **Duration**: 2000-5000ms ตามความสำคัญ
- **Success**: ใช้กับการกระทำสำเร็จ (บันทึก, คัดลอก, ส่ง)
- **Error**: ใช้กับข้อผิดพลาด
- **Thai Language**: ใช้ข้อความภาษาไทยที่ชัดเจน

---

## 🎨 CSS Modules

### Pattern

```tsx
import styles from "@/app/homepage.module.css";

<div className={styles.homeBg}>{/* Content */}</div>;
```

### Example - Background Images

```css
/* homepage.module.css */
.homeBg {
  background-image: url("/assets/images/banner-desktop.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: bottom;
  height: 100%;
  width: 100%;
}

@media (max-width: 768px) {
  .contactBg {
    background-position: bottom right 65%;
  }
}
```

---

## 🎯 Best Practices

### 1. **Color Usage**

✅ **DO:**

```tsx
<div className="bg-primary text-primary-foreground">
<div className="border-primary">
<div className="text-muted-foreground">
```

❌ **DON'T:**

```tsx
<div className="bg-[#085953]">        /* Hard-coded color */
<div className="text-[#000000]">      /* Should use text-foreground */
```

### 2. **Spacing Consistency**

✅ **DO:**

```tsx
<div className="gap-2 md:gap-4">     /* Consistent spacing scale */
<div className="p-4 lg:p-6">
```

❌ **DON'T:**

```tsx
<div className="gap-3 md:gap-5">     /* Non-standard values */
```

### 3. **Component Composition**

✅ **DO:**

```tsx
<Button variant="default" size="sm" className="cursor-pointer">
  <Icon />
  <span>ข้อความ</span>
</Button>
```

❌ **DON'T:**

```tsx
<button style={{ background: "#085953" }}> /* Inline styles */ ข้อความ</button>
```

### 4. **Responsive Design**

✅ **DO:**

```tsx
<div className="flex flex-col lg:flex-row">
<h1 className="text-xl lg:text-4xl">
```

❌ **DON'T:**

```tsx
<div className="flex flex-row">              /* Desktop-first */
<h1 className="text-4xl max-lg:text-xl">   /* Desktop-first */
```

### 5. **Image Optimization**

✅ **DO:**

```tsx
<Image
  src={url}
  alt="meaningful description"
  width={300}
  height={300}
  className="rounded-[20px] object-cover"
/>
```

❌ **DON'T:**

```tsx
<img src={url} />                           /* Regular img tag */
<Image src={url} alt="" />                  /* Empty alt */
```

### 6. **Cursor Pointer**

✅ **DO:**

```tsx
<Button className="cursor-pointer">Click</Button>
<Link className="cursor-pointer" href="/">Link</Link>
```

⚠️ **Required**: เพิ่ม `cursor-pointer` ให้กับ interactive elements

### 7. **CSS Variables**

✅ **DO:**

```tsx
<div className="text-primary bg-background">
<div style={{ color: 'var(--description)' }}>
```

❌ **DON'T:**

```tsx
<div style={{ color: '#085953' }}>
```

---

## 📂 File Structure

```
src/
├── app/
│   ├── globals.css           # Global styles, CSS variables
│   ├── homepage.module.css   # CSS modules
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Pages
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── popover.tsx
│   │   └── ...
│   ├── HeroBanner.tsx        # Custom components
│   ├── CampThumbnail.tsx
│   └── ...
├── lib/
│   ├── utils.ts              # cn() helper and utilities
│   └── ...
└── types/
    └── ...                   # TypeScript types
```

---

## 🔧 Utilities

### cn() Helper

```tsx
import { cn } from "@/lib/utils";

// Merge Tailwind classes with conflict resolution
<div
  className={cn(
    "base-class",
    condition && "conditional-class",
    className, // Props override
  )}
/>;
```

### Class Variance Authority (CVA)

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "variant-classes",
      outline: "variant-classes",
    },
    size: {
      default: "size-classes",
      sm: "size-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

---

## 🌍 Internationalization

### Thai Language Support

- **Font**: Noto Sans Thai
- **Toast Messages**: ข้อความภาษาไทย
- **Content**: ทุก UI text เป็นภาษาไทย

### Examples

```tsx
/* Button labels */
"ติดต่อลงข้อมูล";
"ออกจากระบบ";
"คัดลอก URL เรียบร้อย";

/* Status messages */
"กำลังตรวจสอบการเข้าสู่ระบบ...";
"กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...";
```

---

## 📦 Third-party Libraries

### Social Sharing

```tsx
import { FacebookShareButton, LineShareButton } from 'next-share'

<FacebookShareButton
  url={url}
  quote="ข้อความ"
  hashtag="#hashtag"
>
  <Image src="/assets/images/facebook.png" width={30} height={30} />
</FacebookShareButton>

<LineShareButton
  url={url}
  title="ข้อความ"
>
  <Image src="/assets/images/line.png" width={30} height={30} />
</LineShareButton>
```

### Authentication

```tsx
import { useSession, signOut } from "next-auth/react";

const { data: session, status } = useSession();

// Sign out
signOut({
  callbackUrl: "/",
  redirect: true,
});
```

### Icons

```tsx
import { Share, Link2, Check, LogOut } from "lucide-react";

<Button>
  <Share />
</Button>;
```

---

## 🚀 Performance Guidelines

### 1. **Image Optimization**

- ใช้ `next/image` เสมอ
- กำหนด `width` และ `height`
- ใช้ `priority` สำหรับ above-the-fold images
- ใช้ `loading="lazy"` สำหรับ below-the-fold images (default)

### 2. **Code Splitting**

- ใช้ dynamic imports สำหรับ heavy components
- ใช้ `'use client'` เฉพาะที่จำเป็น

### 3. **CSS Optimization**

- ใช้ Tailwind classes แทน inline styles
- ใช้ CSS modules สำหรับ component-specific styles
- Purge unused CSS (Tailwind default)

---

## 📝 Component Checklist

เมื่อสร้าง component ใหม่ ตรวจสอบ:

- [ ] ใช้ TypeScript with proper types
- [ ] ใช้ color variables แทน hard-coded colors
- [ ] รองรับ dark mode
- [ ] Responsive (mobile-first)
- [ ] Accessibility (aria-labels, semantic HTML)
- [ ] ใช้ `cn()` สำหรับ className merging
- [ ] Props ที่เป็น optional ต้องมี default value
- [ ] Interactive elements ต้องมี `cursor-pointer`
- [ ] Error states and loading states
- [ ] Thai language support

---

## 🔍 References

- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/
- **GSAP**: https://greensock.com/gsap/
- **Sonner**: https://sonner.emilkowal.ski/
- **Next.js**: https://nextjs.org/

---

## 📞 Notes

- อัพเดทเอกสารนี้เมื่อมีการเปลี่ยนแปลง design system
- ถ้าต้องการเพิ่มสีใหม่ ให้เพิ่มใน `globals.css` และอัพเดทเอกสาร
- Component ใหม่ที่สร้างจาก shadcn/ui ควร document ไว้
- Hard-coded colors ควรถูกแปลงเป็น CSS variables

---

**Last Updated**: January 28, 2026
**Version**: 1.1.0
