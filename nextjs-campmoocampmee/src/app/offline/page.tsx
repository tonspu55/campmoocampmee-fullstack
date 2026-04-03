"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">⛺</div>
      <h1 className="text-2xl font-bold">ไม่มีการเชื่อมต่ออินเทอร์เน็ต</h1>
      <p className="text-muted-foreground max-w-sm">
        กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
