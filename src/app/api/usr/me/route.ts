import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/usr/me — get current user profile
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, height_cm, current_weight, created_at FROM users WHERE id = $1`,
      [user.id]
    );
    if (rows.length === 0) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// PUT /api/usr/me — update user profile
export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { full_name, height_cm, current_weight } = await request.json();
    const { rows } = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), height_cm = COALESCE($2, height_cm), current_weight = COALESCE($3, current_weight) WHERE id = $4 RETURNING id, full_name, email, height_cm, current_weight`,
      [full_name, height_cm, current_weight, user.id]
    );
    return Response.json({ success: true, message: "Profile updated", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
