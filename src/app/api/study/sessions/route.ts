import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/study/sessions — list study sessions
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { rows } = await pool.query(
      `SELECT ss.*, st.title as task_title
       FROM study_sessions ss
       LEFT JOIN study_tasks st ON ss.taskId = st.id
       WHERE ss.userId = $1
       ORDER BY ss.started_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM study_sessions WHERE userId = $1`,
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

// POST /api/study/sessions — log a study session
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { taskId, subject, duration_seconds } = await request.json();

    if (!duration_seconds) {
      return Response.json({ success: false, message: "duration_seconds is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO study_sessions (userId, taskId, subject, duration_seconds)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, taskId || null, subject || null, duration_seconds]
    );

    return Response.json({ success: true, message: "Study session logged", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// DELETE /api/study/sessions — delete a study session
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "Session id is required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM study_sessions WHERE id = $1 AND userId = $2`,
      [id, user.id]
    );

    return Response.json({ success: true, message: "Study session deleted" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
