import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "Socket.io handler active",
  });
}

export async function POST() {
  return NextResponse.json({
    status: "online",
    message: "Socket.io handler active",
  });
}
