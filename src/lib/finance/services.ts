import {
  Category,
  TransactionData,
  Transaction,
  TransactionFilters,
  CategorySpending,
  FinancialSummary,
  getCategories,
  createCategory,
  getUserCategories,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategoryWiseSpending,
  getFinancialSummary,
  getRecentTransactions,
} from "./queries";

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates if a string is a valid UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates transaction data before creation/update
 */
function validateTransactionData(data: Partial<TransactionData>): string[] {
  const errors: string[] = [];

  if (data.amount !== undefined) {
    if (typeof data.amount !== "number" || isNaN(data.amount)) {
      errors.push("Amount must be a valid number");
    } else if (data.amount <= 0) {
      errors.push("Amount must be greater than 0");
    } else if (data.amount > 1000000) {
      errors.push("Amount cannot exceed $1,000,000");
    }
  }

  if (data.categoryId !== undefined) {
    if (!data.categoryId || typeof data.categoryId !== "string") {
      errors.push("Category ID is required");
    } else if (!isValidUUID(data.categoryId)) {
      errors.push("Invalid category ID format");
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length > 500) {
      errors.push("Description cannot exceed 500 characters");
    }
  }

  if (data.transaction_date !== undefined) {
    if (
      !(data.transaction_date instanceof Date) ||
      isNaN(data.transaction_date.getTime())
    ) {
      errors.push("Invalid transaction date");
    } else if (data.transaction_date > new Date()) {
      errors.push("Transaction date cannot be in the future");
    }
  }

  return errors;
}

/**
 * Validates category creation data
 */
function validateCategoryData(name: string, type: string): string[] {
  const errors: string[] = [];

  if (!name || typeof name !== "string") {
    errors.push("Category name is required");
  } else if (name.trim().length < 2) {
    errors.push("Category name must be at least 2 characters");
  } else if (name.trim().length > 50) {
    errors.push("Category name cannot exceed 50 characters");
  }

  if (!type || typeof type !== "string") {
    errors.push("Category type is required");
  } else if (!["income", "expense"].includes(type)) {
    errors.push('Category type must be either "income" or "expense"');
  }

  return errors;
}

/**
 * Validates date filters
 */
function validateDateFilters(
  startDate?: string,
  endDate?: string,
): { startDate?: Date; endDate?: Date; errors: string[] } {
  const errors: string[] = [];
  let validStartDate: Date | undefined;
  let validEndDate: Date | undefined;
  const isDateOnly = (value: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (startDate) {
    validStartDate = new Date(startDate);
    if (isNaN(validStartDate.getTime())) {
      errors.push("Invalid start date format");
      validStartDate = undefined;
    } else if (isDateOnly(startDate)) {
      validStartDate.setHours(0, 0, 0, 0);
    }
  }

  if (endDate) {
    validEndDate = new Date(endDate);
    if (isNaN(validEndDate.getTime())) {
      errors.push("Invalid end date format");
      validEndDate = undefined;
    } else if (isDateOnly(endDate)) {
      // Include the entire day for date-only filters.
      validEndDate.setHours(23, 59, 59, 999);
    }
  }

  if (validStartDate && validEndDate && validStartDate > validEndDate) {
    errors.push("Start date cannot be after end date");
  }

  return { startDate: validStartDate, endDate: validEndDate, errors };
}

// =============================================================================
// SERVICE ERROR CLASSES
// =============================================================================

export class ValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super(`Validation failed: ${errors.join(", ")}`);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// =============================================================================
// CATEGORY SERVICES
// =============================================================================

/**
 * Get all available categories
 * Business logic: Returns system-wide categories for dropdowns
 */
export async function getCategoriesService(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch (error) {
    console.error("Service error in getCategoriesService:", error);
    throw new ServiceError("Failed to fetch categories", error as Error);
  }
}

/**
 * Create a new category with validation
 * Business logic: Validates input, prevents duplicates
 */
export async function createCategoryService(
  name: string,
  type: "income" | "expense",
): Promise<Category> {
  // Validate input
  const validationErrors = validateCategoryData(name, type);
  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors);
  }

  try {
    // Trim and normalize name
    const normalizedName = name.trim();
    return await createCategory(normalizedName, type);
  } catch (error) {
    console.error("Service error in createCategoryService:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("already exists")) {
      throw new ValidationError(["Category name already exists for this type"]);
    }

    throw new ServiceError("Failed to create category", error as Error);
  }
}

/**
 * Get categories used by a specific user
 * Business logic: Shows only relevant categories for user history
 */
export async function getUserCategoriesService(
  userId: string,
): Promise<Category[]> {
  // Validate userId
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  try {
    return await getUserCategories(userId);
  } catch (error) {
    console.error("Service error in getUserCategoriesService:", error);
    throw new ServiceError("Failed to fetch user categories", error as Error);
  }
}

// =============================================================================
// TRANSACTION SERVICES
// =============================================================================

/**
 * Get transactions with filters and validation
 * Business logic: Validates filters, applies pagination defaults
 */
export async function getTransactionsService(
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    limit?: string;
    offset?: string;
  },
): Promise<Transaction[]> {
  // Validate userId
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  // Validate and parse filters
  const dateValidation = validateDateFilters(
    filters?.startDate,
    filters?.endDate,
  );
  if (dateValidation.errors.length > 0) {
    throw new ValidationError(dateValidation.errors);
  }

  let limit: number | undefined;
  let offset: number | undefined;
  const validationErrors: string[] = [];

  // Validate pagination
  if (filters?.limit) {
    limit = parseInt(filters.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      validationErrors.push("Limit must be a positive integer");
    } else if (limit > 1000) {
      validationErrors.push("Limit cannot exceed 1000");
    }
  } else {
    limit = 50; // Default limit
  }

  if (filters?.offset) {
    offset = parseInt(filters.offset, 10);
    if (isNaN(offset) || offset < 0) {
      validationErrors.push("Offset must be a non-negative integer");
    }
  }

  // Validate categoryId
  if (filters?.categoryId && !isValidUUID(filters.categoryId)) {
    validationErrors.push("Invalid category ID format");
  }

  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors);
  }

  try {
    const transactionFilters: TransactionFilters = {
      startDate: dateValidation.startDate,
      endDate: dateValidation.endDate,
      categoryId: filters?.categoryId,
      limit,
      offset,
    };

    return await getTransactions(userId, transactionFilters);
  } catch (error) {
    console.error("Service error in getTransactionsService:", error);
    throw new ServiceError("Failed to fetch transactions", error as Error);
  }
}

/**
 * Create a new transaction with validation
 * Business logic: Validates all data, applies business rules
 */
export async function createTransactionService(
  userId: string,
  data: TransactionData,
): Promise<Transaction> {
  // Validate userId
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  // Validate transaction data
  const validationErrors = validateTransactionData({
    ...data,
    categoryId: data.categoryId,
    amount: data.amount,
  });

  // Required fields validation
  if (!data.categoryId) {
    validationErrors.push("Category ID is required");
  }
  if (data.amount === undefined || data.amount === null) {
    validationErrors.push("Amount is required");
  }

  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors);
  }

  try {
    // Set default transaction date if not provided
    const transactionData = {
      ...data,
      transaction_date: data.transaction_date || new Date(),
      description: data.description?.trim() || null,
    };

    return await createTransaction(userId, transactionData);
  } catch (error) {
    console.error("Service error in createTransactionService:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("Invalid category")) {
      throw new ValidationError(["Invalid category ID"]);
    }

    throw new ServiceError("Failed to create transaction", error as Error);
  }
}

/**
 * Update an existing transaction with validation
 * Business logic: Validates data, ensures user owns transaction
 */
export async function updateTransactionService(
  id: string,
  userId: string,
  data: Partial<TransactionData>,
): Promise<Transaction> {
  // Validate IDs
  if (!id || !isValidUUID(id)) {
    throw new ValidationError(["Invalid transaction ID"]);
  }
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  // Validate transaction data
  const validationErrors = validateTransactionData(data);
  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors);
  }

  // Check if there's anything to update
  if (Object.keys(data).length === 0) {
    throw new ValidationError(["No data provided for update"]);
  }

  try {
    // Trim description if provided
    const updateData = {
      ...data,
      description: data.description?.trim(),
    };

    return await updateTransaction(id, userId, updateData);
  } catch (error) {
    console.error("Service error in updateTransactionService:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        throw new NotFoundError("Transaction");
      }
      if (error.message.includes("Invalid category")) {
        throw new ValidationError(["Invalid category ID"]);
      }
    }

    throw new ServiceError("Failed to update transaction", error as Error);
  }
}

/**
 * Delete a transaction with ownership validation
 * Business logic: Ensures user owns transaction before deletion
 */
export async function deleteTransactionService(
  id: string,
  userId: string,
): Promise<void> {
  // Validate IDs
  if (!id || !isValidUUID(id)) {
    throw new ValidationError(["Invalid transaction ID"]);
  }
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  try {
    const deleted = await deleteTransaction(id, userId);
    if (!deleted) {
      throw new NotFoundError("Transaction");
    }
  } catch (error) {
    console.error("Service error in deleteTransactionService:", error);

    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new ServiceError("Failed to delete transaction", error as Error);
  }
}

// =============================================================================
// FINANCIAL SUMMARY SERVICES
// =============================================================================

/**
 * Get comprehensive financial summary for a user
 * Business logic: Validates dates, provides current month by default
 */
export async function getFinancialSummaryService(
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    period?: "current_month" | "custom";
  },
): Promise<{
  summary: FinancialSummary;
  categoryBreakdown: CategorySpending[];
  period: {
    startDate?: Date;
    endDate?: Date;
    description: string;
  };
}> {
  // Validate userId
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let periodDescription = "All time";

  try {
    // Handle different period types
    if (filters?.period === "current_month") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      periodDescription = "Current month";
    } else if (filters?.startDate || filters?.endDate) {
      const dateValidation = validateDateFilters(
        filters.startDate,
        filters.endDate,
      );
      if (dateValidation.errors.length > 0) {
        throw new ValidationError(dateValidation.errors);
      }
      startDate = dateValidation.startDate;
      endDate = dateValidation.endDate;

      if (startDate && endDate) {
        periodDescription = `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      } else if (startDate) {
        periodDescription = `From ${startDate.toLocaleDateString()}`;
      } else if (endDate) {
        periodDescription = `Until ${endDate.toLocaleDateString()}`;
      }
    }

    // Fetch financial data
    const [summary, categoryBreakdown] = await Promise.all([
      getFinancialSummary(userId, startDate, endDate),
      getCategoryWiseSpending(userId, startDate, endDate),
    ]);

    return {
      summary,
      categoryBreakdown,
      period: {
        startDate,
        endDate,
        description: periodDescription,
      },
    };
  } catch (error) {
    console.error("Service error in getFinancialSummaryService:", error);

    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ServiceError("Failed to fetch financial summary", error as Error);
  }
}

/**
 * Get recent transactions for dashboard display
 * Business logic: Returns last 10 transactions with basic info
 */
export async function getRecentTransactionsService(
  userId: string,
  limit: number = 10,
): Promise<Transaction[]> {
  // Validate userId
  if (!userId || !isValidUUID(userId)) {
    throw new ValidationError(["Invalid user ID"]);
  }

  // Validate limit
  if (limit <= 0 || limit > 100) {
    throw new ValidationError(["Limit must be between 1 and 100"]);
  }

  try {
    return await getRecentTransactions(userId, limit);
  } catch (error) {
    console.error("Service error in getRecentTransactionsService:", error);
    throw new ServiceError(
      "Failed to fetch recent transactions",
      error as Error,
    );
  }
}
