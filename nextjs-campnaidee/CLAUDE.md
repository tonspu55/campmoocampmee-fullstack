# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called **Camp Naidee** (แคมป์หมูแคมป์หมี), a Thai camping site booking platform. The app enables users to search and book camping spots throughout Thailand, with features for landowners to manage their properties.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
This project doesn't have a specific test setup configured. Tests would need to be set up if required.

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19
- **Language**: TypeScript 
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Zustand for client-side state
- **Authentication**: NextAuth.js v4
- **CMS**: Sanity.io for content management
- **UI Components**: Radix UI primitives with custom shadcn/ui components

### Key Dependencies
- **Forms**: React Hook Form with Zod validation and @hookform/resolvers
- **Animations**: GSAP for advanced animations, Swiper for carousels
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications
- **Themes**: next-themes for dark/light mode
- **Social Sharing**: next-share

## Project Structure

### App Directory (Next.js App Router)
- `src/app/` - Next.js App Router pages and API routes
  - `api/auth/[...nextauth]/` - NextAuth.js authentication API
  - `api/contact/` - Contact form API endpoint
  - `land/[slug]/` - Dynamic camping site detail pages with gallery support
  - `auth/signin/` - Sign-in page
  - `contact/` - Contact page
  - `landowner/` - Landowner dashboard/registration
  - `search/` - Search functionality

### Components Architecture
- `src/components/ui/` - Reusable UI components (button, form, card, etc.)
- `src/components/header/` - Header-specific components (Logo, Theme switcher)
- `src/components/` - Feature components (forms, galleries, navigation)

### Key Services & Configuration
- `src/sanity/client.ts` - Sanity CMS client configuration
- `src/lib/store.ts` - Zustand state management (scroll state, gallery state)
- `src/lib/utils.ts` - Utility functions and helpers
- `src/lib/videoUtils.ts` - Video handling utilities

### Styling & Assets
- `src/app/globals.css` - Global styles and Tailwind imports
- `src/components/**/*.module.css` - Component-specific CSS modules

## Configuration Files

- `next.config.ts` - Next.js configuration with image domains for Sanity CDN and Google
- `tsconfig.json` - TypeScript configuration with path mapping (@/* → ./src/*)
- `eslint.config.mjs` - ESLint configuration extending Next.js standards
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `package.json` - Project dependencies and scripts

## State Management

The application uses Zustand for lightweight state management:
- **useScrollStore**: Tracks scroll state for UI effects
- **useGalleryStore**: Manages selected image index for gallery interactions

## Authentication & Authorization

- NextAuth.js integration for authentication flow
- Google OAuth provider configured
- Authentication context provided through AuthProvider component

## Content Management

- Sanity.io CMS integration for managing camping site content
- Image optimization through Next.js Image component with Sanity CDN
- Content querying through Sanity client

## Internationalization

- Thai language support with Noto Sans Thai font
- Thai content in metadata and UI
- Google Analytics integration for tracking

## Development Notes

- Uses Turbopack for faster development builds
- Strict TypeScript configuration enabled
- ESLint configured for Next.js and TypeScript best practices
- Path aliases configured (@/* maps to src/*)
- Image optimization configured for Sanity CDN and Google domains