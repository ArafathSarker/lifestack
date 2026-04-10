import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/study/stats — get study summary stats
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Total tasks
    const totalTasks = await pool.query(
      `SELECT COUNT(*) as total FROM study_tasks WHERE userId = $1`,
      [user.id]
    );

    // Completed tasks today
    const completedToday = await pool.query(
      `SELECT COUNT(*) as total FROM study_tasks
       WHERE userId = $1 AND status = 'completed'`,
      [user.id]
    );

    // Pending tasks
    const pendingTasks = await pool.query(
      `SELECT COUNT(*) as total FROM study_tasks
       WHERE userId = $1 AND status = 'pending'`,
      [user.id]
    );

    // Tasks due this week
    const dueThisWeek = await pool.query(
      `SELECT COUNT(*) as total FROM study_tasks
       WHERE userId = $1 AND status = 'pending'
       AND deadline <= NOW() + INTERVAL '7 days'`,
      [user.id]
    );

    // Total study hours this week
    const weeklyStudy = await pool.query(
      `SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds
       FROM study_sessions
       WHERE userId = $1 AND started_at >= NOW() - INTERVAL '7 days'`,
      [user.id]
    );

    // Study by subject
    const bySubject = await pool.query(
      `SELECT subject, COUNT(*) as count FROM study_tasks
       WHERE userId = $1 AND subject IS NOT NULL
       GROUP BY subject ORDER BY count DESC LIMIT 10`,
      [user.id]
    );

    return Response.json({
      success: true,
      data: {
        total_tasks: parseInt(totalTasks.rows[0].total),
        completed_tasks: parseInt(completedToday.rows[0].total),
        pending_tasks: parseInt(pendingTasks.rows[0].total),
        due_this_week: parseInt(dueThisWeek.rows[0].total),
        weekly_study_seconds: parseInt(weeklyStudy.rows[0].total_seconds),
        by_subject: bySubject.rows,
      },
    });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
