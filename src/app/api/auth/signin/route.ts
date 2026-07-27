import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import { verifyPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://cheerful-robin-842.convex.cloud";
    const convex = new ConvexHttpClient(convexUrl);
    const cleanEmail = String(email).toLowerCase().trim();

    // Fetch user by email
    const user = await convex.query(api.users.getUserByEmail, {
      email: cleanEmail,
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password against stored Bcrypt hash
    const isValid = await verifyPassword(String(password), user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
    };

    const token = createSessionToken(userPayload);

    const response = NextResponse.json({
      success: true,
      user: userPayload,
    });

    // Set HTTP-Only Secure Cookie
    response.cookies.set("pixelcode_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Sign in route error:", error);
    const errMsg = error instanceof Error ? error.message : "Sign in failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
