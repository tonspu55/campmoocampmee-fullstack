"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";
const DISMISSED_EXPIRY_DAYS = 14;

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const { expiry } = JSON.parse(raw);
  return Date.now() < expiry;
}

function setDismissed() {
  const expiry = Date.now() + DISMISSED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISSED_KEY, JSON.stringify({ expiry }));
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isInStandaloneMode =
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches;

  if (isInStandaloneMode) return null;
  if (isIOS && /safari/i.test(ua) && !/crios|fxios/i.test(ua)) return "ios";
  if (isAndroid) return "android";
  return null;
}

export default function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;

    const detected = detectPlatform();
    if (!detected) return;
    setPlatform(detected);

    if (detected === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Small delay so the page has loaded visually
        setTimeout(() => setVisible(true), 3000);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (detected === "ios") {
      setTimeout(() => setVisible(true), 3000);
    }
  }, []);

  function handleDismiss() {
    setVisible(false);
    setShowIosGuide(false);
    setDismissed();
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop for iOS guide */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setShowIosGuide(false)}
        />
      )}

      {/* iOS step-by-step guide */}
      {showIosGuide && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl p-6"
          style={{
            background: "oklch(0.98 0.005 186)",
            borderTop: "1px solid oklch(0.85 0.03 186)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "oklch(0.419 0.0707 186.7274)" }}>
              วิธีเพิ่มไปหน้าจอหลัก
            </span>
            <button onClick={() => setShowIosGuide(false)} className="rounded-full p-1 hover:bg-black/5">
              <X size={16} />
            </button>
          </div>
          <ol className="space-y-3">
            {[
              {
                icon: <Share size={18} />,
                text: (
                  <>กดปุ่ม <strong>แชร์</strong> ที่แถบด้านล่างของ Safari</>
                ),
              },
              {
                icon: <Plus size={18} />,
                text: (
                  <>เลื่อนลงและกด <strong>"เพิ่มไปยังหน้าจอหลัก"</strong></>
                ),
              },
              {
                icon: (
                  <Image
                    src="/assets/images/favicon/apple-touch-icon.png"
                    alt="icon"
                    width={18}
                    height={18}
                    className="rounded-sm"
                  />
                ),
                text: <>กด <strong>"เพิ่ม"</strong> เพื่อยืนยัน</>,
              },
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "oklch(0.419 0.0707 186.7274)" }}
                >
                  {step.icon}
                </span>
                <span className="text-sm text-gray-700">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Main banner */}
      {!showIosGuide && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0"
          style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div
            className="relative mx-auto max-w-md overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 186)",
              boxShadow: "0 -2px 40px oklch(0.419 0.0707 186.7274 / 0.15), 0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            {/* Green accent strip */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, oklch(0.419 0.0707 186.7274), oklch(0.55 0.12 155))" }}
            />

            <div className="p-4">
              <button
                onClick={handleDismiss}
                className="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-gray-100"
                aria-label="ปิด"
              >
                <X size={16} className="text-gray-400" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="shrink-0 overflow-hidden rounded-[14px] shadow-md"
                  style={{ boxShadow: "0 2px 8px oklch(0.419 0.0707 186.7274 / 0.3)" }}
                >
                  <Image
                    src="/assets/images/favicon/android-chrome-192x192.png"
                    alt="แคมป์หมูแคมป์หมี"
                    width={52}
                    height={52}
                  />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-[13px] font-bold leading-tight text-gray-900">
                    แคมป์หมูแคมป์หมี
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 leading-snug truncate">
                    หาลานกางเต็นท์ทั่วไทย ⛺
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "oklch(0.88 0 0)" }}
                >
                  ไม่ใช่ตอนนี้
                </button>
                <button
                  onClick={platform === "ios" ? () => setShowIosGuide(true) : handleInstall}
                  className="flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: "oklch(0.419 0.0707 186.7274)" }}
                >
                  {platform === "ios" ? "ดูวิธีติดตั้ง" : "ติดตั้งแอป"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
