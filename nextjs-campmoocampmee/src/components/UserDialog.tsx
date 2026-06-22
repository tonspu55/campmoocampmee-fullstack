'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PhoneOtpForm from '@/components/PhoneOtpForm';

function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|FB_IAB|Line\/|LineBrowser|Instagram|Twitter|Snapchat/i.test(
    ua,
  );
}

interface UserDialogProps {
  className?: string;
  onOpen?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UserDialog({
  className = '',
  onOpen,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: UserDialogProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
  }, []);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isControlled) setInternalOpen(isOpen);
    externalOnOpenChange?.(isOpen);
    if (isOpen) onOpen?.();
  };

  // Avatar button (uncontrolled): logged-in users go to the account page,
  // otherwise open the login dialog.
  const handleAvatarClick = () => {
    onOpen?.();
    if (session) {
      router.push('/account');
    } else {
      setInternalOpen(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <Button
          onClick={handleAvatarClick}
          aria-label="บัญชีของฉัน"
          className={`flex h-9 w-9 items-center justify-center rounded-full cursor-pointer ${className}`}
        >
          <User />
        </Button>
      )}
      <DialogContent className="p-4 sm:max-w-md z-999">
        <DialogHeader className="sr-only">
          <DialogTitle>เข้าสู่ระบบ</DialogTitle>
        </DialogHeader>
        <PhoneOtpForm
          title="สร้างบัญชีหรือเข้าสู่ระบบ"
          callbackUrl={
            typeof window !== 'undefined' ? window.location.href : '/'
          }
          onSuccess={() => handleOpenChange(false)}
          googleSlot={
            inAppBrowser ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold mb-1">
                    ไม่สามารถเข้าสู่ระบบด้วย Google ได้
                  </p>
                  <p>
                    เบราว์เซอร์ในแอป (Facebook / Line)
                    ไม่รองรับการเข้าสู่ระบบด้วย Google กรุณาเปิดในเบราว์เซอร์
                    Safari หรือ Chrome
                  </p>
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2 w-full text-base"
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="gap-3 w-full text-base"
              >
                {loading ? (
                  <div className="size-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'ดำเนินการต่อด้วยบัญชี Google'}
              </Button>
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
