import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/dashboard/stats — aggregated dashboard data
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // User profile
    const profile = await pool.query(
      `SELECT full_name, height_cm, current_weight FROM users WHERE id = $1`,
      [user.id]
    );

    // Workout stats for today
    const todayWorkout = await pool.query(
      `SELECT COALESCE(SUM(calories_burned), 0) as calories, COALESCE(SUM(duration_mins), 0) as duration
       FROM workout_logs
       WHERE userId = $1 AND log_date::date = CURRENT_DATE`,
      [user.id]
    );

    // Recent workouts (last 3)
    const recentWorkouts = await pool.query(
      `SELECT * FROM workout_logs WHERE userId = $1 ORDER BY log_date DESC LIMIT 3`,
      [user.id]
    );

    // Finance balance
    const balance = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
       FROM transactions WHERE userId = $1`,
      [user.id]
    );

    // Recent transactions (last 4)
    const recentTransactions = await pool.query(
      `SELECT t.*, fc.name as category_name
       FROM transactions t
       LEFT JOIN finance_categories fc ON t.categoryId = fc.id
       WHERE t.userId = $1
       ORDER BY t.transaction_date DESC LIMIT 4`,
      [user.id]
    );

    // Monthly spending
    const monthlySpending = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE userId = $1 AND type = 'expense'
       AND transaction_date >= date_trunc('month', CURRENT_DATE)`,
      [user.id]
    );

    // Study hours today
    const todayStudy = await pool.query(
      `SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds
       FROM study_sessions
       WHERE userId = $1 AND started_at::date = CURRENT_DATE`,
      [user.id]
    );

    // BMI calculation
    const height_cm = profile.rows[0]?.height_cm || 0;
    const weight_kg = profile.rows[0]?.current_weight || 0;
    const bmi = height_cm > 0 ? (weight_kg / ((height_cm / 100) ** 2)).toFixed(1) : "N/A";

    return Response.json({
      success: true,
      data: {
        user: {
          name: profile.rows[0]?.full_name || "User",
          height_cm,
          weight_kg,
          bmi,
        },
        fitness: {
          today_calories: parseInt(todayWorkout.rows[0].calories),
          today_duration: parseInt(todayWorkout.rows[0].duration),
          recent_workouts: recentWorkouts.rows,
        },
        finance: {
          balance: parseFloat(balance.rows[0].balance),
          monthly_spending: parseFloat(monthlySpending.rows[0].total),
          recent_transactions: recentTransactions.rows,
        },
        study: {
          today_hours: (parseInt(todayStudy.rows[0].total_seconds) / 3600).toFixed(1),
        },
      },
    });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
