import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import { hashPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://cheerful-robin-842.convex.cloud";
    const convex = new ConvexHttpClient(convexUrl);
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();

    // Check if user already exists
    const existingUser = await convex.query(api.users.getUserByEmail, {
      email: cleanEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password with Bcrypt (cost factor 10)
    const passwordHash = await hashPassword(password);
    const userId = "usr_" + Math.random().toString(36).substring(2, 12);

    // Store user in Convex DB
    await convex.mutation(api.users.createUser, {
      userId,
      email: cleanEmail,
      name: cleanName,
      passwordHash,
    });

    const userPayload = { userId, email: cleanEmail, name: cleanName };
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
    console.error("Sign up route error:", error);
    const errMsg = error instanceof Error ? error.message : "Sign up failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
