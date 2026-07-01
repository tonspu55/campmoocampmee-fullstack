'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { ChevronLeft, Smartphone } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toE164TH, isValidThaiMobile } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const RESEND_COOLDOWN = 300; // seconds (matches OTP validity window)

type Step = 'choose' | 'phone' | 'otp';

interface PhoneOtpFormProps {
  /** Where to redirect after a successful sign-in. */
  callbackUrl?: string;
  onSuccess?: () => void;
  /** Title shown on the method-chooser step. */
  title?: string;
  /** Optional description under the title on the chooser step. */
  description?: string;
  /** Rendered under the "หรือ" divider — e.g. the Google button. */
  googleSlot?: ReactNode;
}

/** Random display-only reference code shown in the OTP screen (cosmetic). */
function makeRefCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export default function PhoneOtpForm({
  callbackUrl = '/',
  onSuccess,
  title = 'สร้างบัญชีหรือเข้าสู่ระบบ',
  description,
  googleSlot,
}: PhoneOtpFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('choose');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist the resend cooldown so it survives closing/reopening the popup.
  const cooldownKey = 'phone-otp-cooldown';

  const clearStoredCooldown = useCallback(() => {
    try {
      localStorage.removeItem(cooldownKey);
    } catch {}
  }, [cooldownKey]);

  // Run a countdown toward an absolute expiry timestamp (ms since epoch), so
  // remaining time is correct even after the component remounts.
  const runCountdown = useCallback(
    (until: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
        setCooldown(remaining);
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          clearStoredCooldown();
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [clearStoredCooldown],
  );

  // Restore an in-progress cooldown (and the OTP step) on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cooldownKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          phoneNumber?: string;
          until?: number;
          refCode?: string;
        };
        if (typeof saved.until === 'number' && saved.until > Date.now()) {
          if (saved.phoneNumber) setPhone(saved.phoneNumber);
          if (saved.refCode) setRefCode(saved.refCode);
          setStep('otp');
          runCountdown(saved.until);
        } else {
          localStorage.removeItem(cooldownKey);
        }
      }
    } catch {}
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldownKey, runCountdown]);

  const sendOtp = async () => {
    if (!isValidThaiMobile(phone)) {
      toast.error('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง');
      return;
    }
    setLoading(true);
    const phoneE164 = toE164TH(phone);
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneE164,
    });
    setLoading(false);
    if (error) {
      toast.error('ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      return;
    }
    const ref = makeRefCode();
    const until = Date.now() + RESEND_COOLDOWN * 1000;
    setRefCode(ref);
    setStep('otp');
    try {
      localStorage.setItem(
        cooldownKey,
        JSON.stringify({ phoneNumber: phoneE164, until, refCode: ref }),
      );
    } catch {}
    runCountdown(until);
  };

  const verifyOtp = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: toE164TH(phone),
      code,
    });
    setLoading(false);

    if (error) {
      const message =
        error.code === 'OTP_EXPIRED'
          ? 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่'
          : error.code === 'TOO_MANY_ATTEMPTS'
            ? 'กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่'
            : 'รหัส OTP ไม่ถูกต้อง';
      toast.error(message);
      setCode('');
      return;
    }

    clearStoredCooldown();
    toast.success('เข้าสู่ระบบสำเร็จ');
    onSuccess?.();
    router.push(callbackUrl);
  };

  const spinner = (
    <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  // ── Step: choose method ────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex  items-center justify-center ">
            <Image
              priority
              src="/assets/images/logo.svg"
              alt="แคมป์หมูแคมป์หมี Logo"
              width={60}
              height={60}
            ></Image>
          </div>
          <h2 className="text-xl font-semibold mt-1">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <Button
          onClick={() => setStep('phone')}
          className="w-full gap-2 text-base"
        >
          <Smartphone className="size-4" />
          ดำเนินการต่อด้วยหมายเลขโทรศัพท์
        </Button>

        {googleSlot && (
          <>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="h-px flex-1 bg-border" />
              <span>หรือ</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {googleSlot}
          </>
        )}
      </div>
    );
  }

  // ── Step: enter phone number ───────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="flex flex-col gap-5">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setStep('choose')}
            aria-label="ย้อนกลับ"
            className="absolute left-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="text-xl font-semibold">กรอกหมายเลขโทรศัพท์ของคุณ</h2>
        </div>

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
    );
  }

  // ── Step: enter OTP ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
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
        <h2 className="text-xl font-semibold">กรุณากรอกรหัส OTP</h2>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        กรอกรหัส 6 หลัก ที่ส่งไปยังเบอร์โทรศัพท์
        <br />
        {toE164TH(phone).replace('+66', '(+66) ')}
        {refCode && ` (รหัสอ้างอิง : ${refCode})`}
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
  );
}
