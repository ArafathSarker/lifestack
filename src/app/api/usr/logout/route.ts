import { cookies } from "next/headers";

// POST /api/usr/logout — clear auth cookie
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return Response.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
