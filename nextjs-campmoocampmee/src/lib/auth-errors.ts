/**
 * Map a Better Auth client error into a user-facing Thai message.
 *
 * The most common cause of a bare 500 here is the backend being unreachable —
 * typically the Supabase project being paused (free tier auto-pauses after
 * ~7 days of inactivity). We never want to show the raw error to the user, so
 * 5xx / network failures collapse into a reassuring "temporary problem" message
 * instead of a blank 500.
 */
export function authErrorMessage(
  error?: { status?: number; message?: string; code?: string } | null,
): string {
  const status = error?.status ?? 0;

  // status 0 = fetch threw (offline / server down); 5xx = server/DB failure.
  if (status === 0 || status >= 500) {
    return 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลัง';
  }
  if (status === 429) {
    return 'มีการร้องขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
  }
  return 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
}
