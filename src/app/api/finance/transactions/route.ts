import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/finance/transactions — list user's transactions
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { rows } = await pool.query(
      `SELECT t.*, fc.name as category_name, fc.type as category_type
       FROM transactions t
       LEFT JOIN finance_categories fc ON t.categoryId = fc.id
       WHERE t.userId = $1
       ORDER BY t.transaction_date DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM transactions WHERE userId = $1`,
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

// POST /api/finance/transactions — add a new transaction
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { categoryId, amount, type, description, transaction_date } = await request.json();

    if (!amount) {
      return Response.json({ success: false, message: "amount is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO transactions (userId, categoryId, amount, type, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.id, categoryId || null, amount, type || "expense", description || null, transaction_date || new Date()]
    );

    return Response.json({ success: true, message: "Transaction added", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// DELETE /api/finance/transactions — delete a transaction
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "Transaction id is required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM transactions WHERE id = $1 AND userId = $2`,
      [id, user.id]
    );

    return Response.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
