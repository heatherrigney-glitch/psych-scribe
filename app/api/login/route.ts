import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  // IMPORTANT: change this to your real password check
  if (password !== process.env.PSYCH_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Set the auth cookie
  res.cookies.set({
    name: "psych_auth",
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
