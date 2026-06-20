import { NextResponse } from "next/server";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";

const cookieStore = new SessionCookieStore();

export async function POST() {
  await cookieStore.clear();
  return NextResponse.json({ success: true });
}
