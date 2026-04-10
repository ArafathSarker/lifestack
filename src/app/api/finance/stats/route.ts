import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/finance/stats — get finance summary stats
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // This month's income
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE userId = $1 AND type = 'income'
       AND transaction_date >= date_trunc('month', CURRENT_DATE)`,
      [user.id]
    );

    // This month's expense
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE userId = $1 AND type = 'expense'
       AND transaction_date >= date_trunc('month', CURRENT_DATE)`,
      [user.id]
    );

    // Total balance (all time income - expense)
    const balanceResult = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
       FROM transactions
       WHERE userId = $1`,
      [user.id]
    );

    const income = parseFloat(incomeResult.rows[0].total);
    const expense = parseFloat(expenseResult.rows[0].total);
    const balance = parseFloat(balanceResult.rows[0].balance);
    const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : "0";

    return Response.json({
      success: true,
      data: {
        monthly_income: income,
        monthly_expense: expense,
        total_balance: balance,
        savings_rate: savingsRate,
      },
    });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
