import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/finance/categories — list all finance categories
export async function GET() {
  try {
    const { rows } = await pool.query(`SELECT * FROM finance_categories ORDER BY name ASC`);
    return Response.json({ success: true, data: rows });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// POST /api/finance/categories — create a new category
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return Response.json({ success: false, message: "name and type are required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO finance_categories (name, type) VALUES ($1, $2) RETURNING *`,
      [name, type]
    );

    return Response.json({ success: true, message: "Category created", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
