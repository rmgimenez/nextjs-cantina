import { NextResponse } from "next/server";
import { COOKIE_NAME } from "../../../../lib/jwt";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Limpar cookie de sessão
  const isProd = process.env.NODE_ENV === "production";
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;

  response.headers.set("Set-Cookie", cookie);

  return response;
}
