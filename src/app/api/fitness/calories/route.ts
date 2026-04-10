import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/fitness/calories — list calorie logs
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { rows } = await pool.query(
      `SELECT * FROM calorie_logs WHERE userId = $1 ORDER BY log_date DESC LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM calorie_logs WHERE userId = $1`,
      [user.id]
    );

    return Response.json({
      success: true,
      data: rows,
      total: parseInt(countResult.rows[0].total),
    });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// POST /api/fitness/calories — add calorie log
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { meal_name, calories_consumed, calories_burned, log_date } = await request.json();

    const { rows } = await pool.query(
      `INSERT INTO calorie_logs (userId, meal_name, calories_consumed, calories_burned, log_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, meal_name || null, calories_consumed || 0, calories_burned || 0, log_date || new Date()]
    );

    return Response.json({ success: true, message: "Calorie log added", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// DELETE /api/fitness/calories — delete a calorie log
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "Calorie log id is required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM calorie_logs WHERE id = $1 AND userId = $2`,
      [id, user.id]
    );

    return Response.json({ success: true, message: "Calorie log deleted" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
