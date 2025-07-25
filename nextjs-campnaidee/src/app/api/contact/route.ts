import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campName, phoneNumber, lineId } = body;

    // Validate required fields
    if (!campName || !phoneNumber) {
      return NextResponse.json(
        { error: "ชื่อแคมป์และเบอร์ติดต่อเป็นข้อมูลที่จำเป็น" },
        { status: 400 }
      );
    }

    // Check if Sanity token is configured
    if (!process.env.SANITY_API_TOKEN) {
      console.error("SANITY_API_TOKEN is not configured");
      return NextResponse.json(
        { error: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง" },
        { status: 500 }
      );
    }

    // Create document in Sanity
    const result = await client.create({
      _type: "submitContact",
      campName,
      telNumber: phoneNumber,
      lineId: lineId || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
    });

    return NextResponse.json(
      {
        message:
          "ส่งข้อมูลเรียบร้อยแล้ว แคมป์หมู แคมป์หมี จะติดต่อกลับโดยเร็วที่สุด",
        id: result._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact submission:", error);

    // Check if it's a Sanity-specific error
    if (error instanceof Error) {
      if (error.message.includes("Insufficient permissions")) {
        return NextResponse.json(
          {
            error:
              "ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาตรวจสอบการตั้งค่า API Token",
          },
          { status: 403 }
        );
      }
      if (error.message.includes("Unknown document type")) {
        return NextResponse.json(
          { error: "ประเภทเอกสารไม่ถูกต้อง กรุณาตรวจสอบ Schema" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
