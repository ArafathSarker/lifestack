import pool from "@/_lib/config/db";
import { getAuthUser, unauthorized } from "@/_lib/authHelper";

// GET /api/study/tasks — list user's study tasks
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status"); // 'pending', 'completed', or null for all

    let query = `SELECT * FROM study_tasks WHERE userId = $1`;
    const params: (string | number)[] = [user.id];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY deadline ASC NULLS LAST`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM study_tasks WHERE userId = $1`;
    const countParams: (string | number)[] = [user.id];
    if (status) {
      countParams.push(status);
      countQuery += ` AND status = $${countParams.length}`;
    }

    const countResult = await pool.query(countQuery, countParams);

    return Response.json({
      success: true,
      data: rows,
      total: parseInt(countResult.rows[0].total),
    });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// POST /api/study/tasks — create a new study task
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { title, subject, task_description, priority, deadline } = await request.json();

    if (!title) {
      return Response.json({ success: false, message: "title is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO study_tasks (userId, title, subject, task_description, priority, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [user.id, title, subject || null, task_description || null, priority || "medium", deadline || null]
    );

    return Response.json({ success: true, message: "Task created", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// PATCH /api/study/tasks — update task status
export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { id, status, title, subject, task_description, priority, deadline } = await request.json();

    if (!id) {
      return Response.json({ success: false, message: "Task id is required" }, { status: 400 });
    }

    const fields: string[] = [];
    const values: (string | null)[] = [];
    let paramCount = 0;

    if (status !== undefined) { paramCount++; fields.push(`status = $${paramCount}`); values.push(status); }
    if (title !== undefined) { paramCount++; fields.push(`title = $${paramCount}`); values.push(title); }
    if (subject !== undefined) { paramCount++; fields.push(`subject = $${paramCount}`); values.push(subject); }
    if (task_description !== undefined) { paramCount++; fields.push(`task_description = $${paramCount}`); values.push(task_description); }
    if (priority !== undefined) { paramCount++; fields.push(`priority = $${paramCount}`); values.push(priority); }
    if (deadline !== undefined) { paramCount++; fields.push(`deadline = $${paramCount}`); values.push(deadline); }

    if (fields.length === 0) {
      return Response.json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    values.push(id);
    paramCount++;
    values.push(user.id);

    const { rows } = await pool.query(
      `UPDATE study_tasks SET ${fields.join(", ")} WHERE id = $${paramCount - 1} AND userId = $${paramCount} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return Response.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Task updated", data: rows[0] });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}

// DELETE /api/study/tasks — delete a study task
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "Task id is required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM study_tasks WHERE id = $1 AND userId = $2`,
      [id, user.id]
    );

    return Response.json({ success: true, message: "Task deleted" });
  } catch (err) {
    return Response.json({ success: false, message: String(err) }, { status: 500 });
  }
}
