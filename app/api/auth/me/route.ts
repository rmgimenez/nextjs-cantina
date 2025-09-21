import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "../../../../lib/jwt";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + "="));
  if (!match)
    return NextResponse.json({ authenticated: false }, { status: 200 });
  const token = match.split("=")[1];
  const data = verifyToken(token);
  if (!data)
    return NextResponse.json({ authenticated: false }, { status: 200 });
  return NextResponse.json({ authenticated: true, user: data });
}
