import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";
import { cookies } from "next/headers";

// POST /api/usr/logout — clear auth cookie
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.IS_PRODUCTION === "yes",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return Response.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
