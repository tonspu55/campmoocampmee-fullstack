'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { authErrorMessage } from '@/lib/auth-errors';
import { toE164TH, isValidThaiMobile } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const RESEND_COOLDOWN = 300; // seconds (matches OTP validity window)

type Step = 'phone' | 'otp';

interface AddPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the phone is successfully attached (e.g. refetch session). */
  onSuccess?: () => void;
}

// Dialog for a logged-in user (e.g. signed in with Google) to attach a verified
// phone number to their account. Kept separate from the login PhoneOtpForm so
// the critical sign-in flow stays untouched; reuses the same phone/OTP
// primitives. Sends the OTP via Better Auth, then verifies through the
// /api/account/phone route (which attaches it + mirrors to Sanity).
export default function AddPhoneDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPhoneDialogProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset everything whenever the dialog closes so it reopens clean.
  useEffect(() => {
    if (!open) {
      setStep('phone');
      setPhone('');
      setCode('');
      setLoading(false);
      setCooldown(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const startCooldown = () => {
    const until = Date.now() + RESEND_COOLDOWN * 1000;
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldown(remaining);
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const sendOtp = async () => {
    if (!isValidThaiMobile(phone)) {
      toast.error('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง');
      return;
    }
    setLoading(true);
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: toE164TH(phone),
    });
    setLoading(false);
    if (error) {
      toast.error(
        (error.status ?? 0) >= 500
          ? authErrorMessage(error)
          : 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      );
      return;
    }
    setStep('otp');
    startCooldown();
  };

  const verifyOtp = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    const res = await fetch('/api/account/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: toE164TH(phone), code }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'เพิ่มเบอร์โทรศัพท์ไม่สำเร็จ');
      setCode('');
      return;
    }

    toast.success('เพิ่มเบอร์โทรศัพท์สำเร็จ');
    onSuccess?.();
    onOpenChange(false);
  };

  const spinner = (
    <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'phone' ? (
          <>
            <DialogHeader>
              <DialogTitle>เพิ่มเบอร์โทรศัพท์</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <div className="flex items-center rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
                <span className="px-3 text-sm text-muted-foreground">+66</span>
                <div className="h-6 w-px bg-border" />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="หมายเลขโทรศัพท์ของคุณ"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendOtp();
                  }}
                  disabled={loading}
                  className="flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
                />
              </div>

              <Button
                onClick={sendOtp}
                disabled={loading}
                className="w-full text-base"
              >
                {loading ? spinner : 'ขอรหัสยืนยัน OTP'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                  }}
                  aria-label="ย้อนกลับ"
                  className="absolute left-0 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <DialogTitle>กรุณากรอกรหัส OTP</DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <p className="text-center text-sm text-muted-foreground">
                กรอกรหัส 6 หลัก ที่ส่งไปยังเบอร์โทรศัพท์
                <br />
                {toE164TH(phone).replace('+66', '(+66) ')}
              </p>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  onComplete={verifyOtp}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={cooldown > 0 || loading}
                  className="font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {cooldown > 0
                    ? `ส่งรหัส OTP อีกครั้ง (${cooldown} วินาที)`
                    : 'ส่งรหัส OTP อีกครั้ง'}
                </button>
              </div>

              <Button
                onClick={verifyOtp}
                disabled={loading || code.length !== 6}
                className="w-full text-base"
              >
                {loading ? spinner : 'ยืนยัน'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
