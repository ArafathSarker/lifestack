import pool from "@/_lib/config/db";
import { PoolClient } from "pg";

// Types for function parameters and return values
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export interface TransactionData {
  categoryId: string;
  amount: number;
  description?: string;
  transaction_date?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryType: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: Date;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryType: "income" | "expense";
  totalAmount: number;
  transactionCount: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

// =============================================================================
// CATEGORY QUERIES
// =============================================================================

/**
 * Get all available categories (shared across all users)
 * Note: Categories are system-wide, not user-specific
 */
export async function getCategories(): Promise<Category[]> {
  const client: PoolClient = await pool.connect();

  try {
    const query = `
      SELECT id, name, type
      FROM finance_categories
      ORDER BY type, name ASC
    `;

    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  } finally {
    client.release();
  }
}

/**
 * Create a new category (system-wide)
 * Prevents duplicate category names per type
 */
export async function createCategory(
  name: string,
  type: "income" | "expense",
): Promise<Category> {
  const client: PoolClient = await pool.connect();

  try {
    // Check for duplicate category name within the same type
    const duplicateCheck = `
      SELECT id FROM finance_categories 
      WHERE LOWER(name) = LOWER($1) AND type = $2
    `;
    const duplicateResult = await client.query(duplicateCheck, [name, type]);

    if (duplicateResult.rows.length > 0) {
      throw new Error(`Category "${name}" already exists for type "${type}"`);
    }

    const insertQuery = `
      INSERT INTO finance_categories (name, type)
      VALUES ($1, $2)
      RETURNING id, name, type
    `;

    const result = await client.query(insertQuery, [name, type]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create category");
  } finally {
    client.release();
  }
}

/**
 * Get categories that have been used by a specific user
 * Useful for showing only relevant categories in dropdowns
 */
export async function getUserCategories(userId: string): Promise<Category[]> {
  const client: PoolClient = await pool.connect();

  try {
    const query = `
      SELECT DISTINCT fc.id, fc.name, fc.type
      FROM finance_categories fc
      INNER JOIN transactions t ON fc.id = t.categoryId
      WHERE t.userId = $1
      ORDER BY fc.type, fc.name ASC
    `;

    const result = await client.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching user categories:", error);
    throw new Error("Failed to fetch user categories");
  } finally {
    client.release();
  }
}

// =============================================================================
// TRANSACTION QUERIES
// =============================================================================

/**
 * Get transactions for a user with optional filters
 * Includes category information via JOIN
 */
export async function getTransactions(
  userId: string,
  filters?: TransactionFilters,
): Promise<Transaction[]> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT 
        t.id,
        t.userId,
        t.categoryId,
        fc.name as categoryName,
        fc.type as categoryType,
        t.amount,
        t.description,
        t.transaction_date
      FROM transactions t
      INNER JOIN finance_categories fc ON t.categoryId = fc.id
      WHERE t.userId = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    // Apply filters
    if (filters?.startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.categoryId) {
      query += ` AND t.categoryId = $${paramIndex}`;
      params.push(filters.categoryId);
      paramIndex++;
    }

    query += ` ORDER BY t.transaction_date DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await client.query(query, params);
    return result.rows.map((row) => ({
      ...row,
      amount: parseFloat(row.amount),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  } finally {
    client.release();
  }
}

/**
 * Create a new transaction for a user
 */
export async function createTransaction(
  userId: string,
  data: TransactionData,
): Promise<Transaction> {
  const client: PoolClient = await pool.connect();

  try {
    // Verify category exists
    const categoryCheck = `SELECT id, name, type FROM finance_categories WHERE id = $1`;
    const categoryResult = await client.query(categoryCheck, [data.categoryId]);

    if (categoryResult.rows.length === 0) {
      throw new Error("Invalid category ID");
    }

    const insertQuery = `
      INSERT INTO transactions (userId, categoryId, amount, description, transaction_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const transactionDate = data.transaction_date || new Date();
    const params = [
      userId,
      data.categoryId,
      data.amount,
      data.description || null,
      transactionDate,
    ];

    const result = await client.query(insertQuery, params);
    const transaction = result.rows[0];

    // Return transaction with category info
    return {
      ...transaction,
      categoryName: categoryResult.rows[0].name,
      categoryType: categoryResult.rows[0].type,
      amount: parseFloat(transaction.amount),
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create transaction");
  } finally {
    client.release();
  }
}

/**
 * Update an existing transaction (user-scoped for security)
 */
export async function updateTransaction(
  id: string,
  userId: string,
  data: Partial<TransactionData>,
): Promise<Transaction> {
  const client: PoolClient = await pool.connect();

  try {
    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [id, userId];
    let paramIndex = 3;

    if (data.categoryId !== undefined) {
      // Verify category exists if updating
      const categoryCheck = `SELECT id FROM finance_categories WHERE id = $${paramIndex}`;
      const categoryResult = await client.query(categoryCheck, [
        data.categoryId,
      ]);
      if (categoryResult.rows.length === 0) {
        throw new Error("Invalid category ID");
      }

      updateFields.push(`categoryId = $${paramIndex}`);
      params.push(data.categoryId);
      paramIndex++;
    }

    if (data.amount !== undefined) {
      updateFields.push(`amount = $${paramIndex}`);
      params.push(data.amount);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(data.description);
      paramIndex++;
    }

    if (data.transaction_date !== undefined) {
      updateFields.push(`transaction_date = $${paramIndex}`);
      params.push(data.transaction_date);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    const updateQuery = `
      UPDATE transactions 
      SET ${updateFields.join(", ")}
      WHERE id = $1 AND userId = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, params);

    if (result.rows.length === 0) {
      throw new Error("Transaction not found or access denied");
    }

    // Get transaction with category info
    const transactionWithCategory = await getTransactions(userId, {
      limit: 1,
    });

    const updatedTransaction = transactionWithCategory.find((t) => t.id === id);
    if (!updatedTransaction) {
      throw new Error("Failed to retrieve updated transaction");
    }

    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update transaction");
  } finally {
    client.release();
  }
}

/**
 * Delete a transaction (user-scoped for security)
 */
export async function deleteTransaction(
  id: string,
  userId: string,
): Promise<boolean> {
  const client: PoolClient = await pool.connect();

  try {
    const deleteQuery = `
      DELETE FROM transactions 
      WHERE id = $1 AND userId = $2
    `;

    const result = await client.query(deleteQuery, [id, userId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  } finally {
    client.release();
  }
}

// =============================================================================
// FINANCIAL SUMMARY QUERIES
// =============================================================================

/**
 * Get total income for a user
 * Optionally filter by date range
 */
export async function getTotalIncome(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      INNER JOIN finance_categories fc ON t.categoryId = fc.id
      WHERE t.userId = $1 AND fc.type = 'income'
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await client.query(query, params);
    return parseFloat(result.rows[0].total);
  } catch (error) {
    console.error("Error calculating total income:", error);
    throw new Error("Failed to calculate total income");
  } finally {
    client.release();
  }
}

/**
 * Get total expenses for a user
 * Optionally filter by date range
 */
export async function getTotalExpenses(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      INNER JOIN finance_categories fc ON t.categoryId = fc.id
      WHERE t.userId = $1 AND fc.type = 'expense'
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await client.query(query, params);
    return parseFloat(result.rows[0].total);
  } catch (error) {
    console.error("Error calculating total expenses:", error);
    throw new Error("Failed to calculate total expenses");
  } finally {
    client.release();
  }
}

/**
 * Get balance (income - expenses) for a user
 * Optionally filter by date range
 */
export async function getBalance(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN fc.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN fc.type = 'expense' THEN t.amount ELSE 0 END), 0) as expenses
      FROM transactions t
      INNER JOIN finance_categories fc ON t.categoryId = fc.id
      WHERE t.userId = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await client.query(query, params);
    const { income, expenses } = result.rows[0];
    return parseFloat(income) - parseFloat(expenses);
  } catch (error) {
    console.error("Error calculating balance:", error);
    throw new Error("Failed to calculate balance");
  } finally {
    client.release();
  }
}

/**
 * Get spending breakdown by category for a user
 * Optionally filter by date range
 */
export async function getCategoryWiseSpending(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<CategorySpending[]> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT 
        fc.id as categoryId,
        fc.name as categoryName,
        fc.type as categoryType,
        COALESCE(SUM(t.amount), 0) as totalAmount,
        COUNT(t.id) as transactionCount
      FROM finance_categories fc
      LEFT JOIN transactions t ON fc.id = t.categoryId AND t.userId = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate || endDate) {
      // Add WHERE clause for date filtering if dates are provided
      if (startDate) {
        query += ` AND (t.transaction_date IS NULL OR t.transaction_date >= $${paramIndex})`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND (t.transaction_date IS NULL OR t.transaction_date <= $${paramIndex})`;
        params.push(endDate);
        paramIndex++;
      }
    }

    query += `
      GROUP BY fc.id, fc.name, fc.type
      HAVING COUNT(t.id) > 0
      ORDER BY totalAmount DESC, fc.name ASC
    `;

    const result = await client.query(query, params);
    return result.rows.map((row) => ({
      ...row,
      totalAmount: parseFloat(row.totalamount),
      transactionCount: parseInt(row.transactioncount),
    }));
  } catch (error) {
    console.error("Error fetching category-wise spending:", error);
    throw new Error("Failed to fetch category-wise spending");
  } finally {
    client.release();
  }
}

/**
 * Get complete financial summary for a user
 * Combines income, expenses, and balance in one query
 */
export async function getFinancialSummary(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<FinancialSummary> {
  const client: PoolClient = await pool.connect();

  try {
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN fc.type = 'income' THEN t.amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN fc.type = 'expense' THEN t.amount ELSE 0 END), 0) as totalExpenses
      FROM transactions t
      INNER JOIN finance_categories fc ON t.categoryId = fc.id
      WHERE t.userId = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await client.query(query, params);
    const { totalincome, totalexpenses } = result.rows[0];

    const totalIncome = parseFloat(totalincome);
    const totalExpenses = parseFloat(totalexpenses);
    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
    };
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    throw new Error("Failed to fetch financial summary");
  } finally {
    client.release();
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get recent transactions (last 10 by default)
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 10,
): Promise<Transaction[]> {
  return getTransactions(userId, { limit });
}

/**
 * Get transactions for current month
 */
export async function getCurrentMonthTransactions(
  userId: string,
): Promise<Transaction[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return getTransactions(userId, { startDate, endDate });
}

/**
 * Get monthly financial summary
 */
export async function getMonthlyFinancialSummary(
  userId: string,
): Promise<FinancialSummary> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return getFinancialSummary(userId, startDate, endDate);
}
