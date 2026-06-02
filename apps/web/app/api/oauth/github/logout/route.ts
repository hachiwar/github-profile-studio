import { NextResponse } from "next/server";

const cookieName = "gps_github_token";

export async function POST() {
  const response = NextResponse.json({ authenticated: false, tokenStored: false });
  response.cookies.set(cookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
