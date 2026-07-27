import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pixelcode_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifySessionToken(token);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null });
  }
}
