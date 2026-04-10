import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionsService,
  createTransactionService,
  ValidationError,
  ServiceError,
  NotFoundError,
} from "@/lib/finance/services";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Mock function to get userId from request
 * In production, this would extract userId from JWT token or session
 */
function getUserId(request: NextRequest): string {
  // For development/testing, return a mock userId
  // In production, extract from Authorization header or session
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // TODO: Decode JWT token and extract userId
    // For now, return mock userId
    return "550e8400-e29b-41d4-a716-446655440000"; // Mock UUID
  }

  // Fallback mock userId for development
  return "550e8400-e29b-41d4-a716-446655440000";
}

/**
 * Standardized error response formatter
 */
function createErrorResponse(
  error: unknown,
  defaultMessage = "Internal server error",
): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error.errors,
      },
      { status: 400 },
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: defaultMessage,
    },
    { status: 500 },
  );
}

function parseTransactionDateInput(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map((part) => Number(part));
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  return new Date(value);
}

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/finance/transactions
 * Retrieve transactions for a user with optional filters
 *
 * Query params:
 *   - startDate: ISO date string (optional)
 *   - endDate: ISO date string (optional)
 *   - categoryId: UUID string (optional)
 *   - limit: number (optional, default: 50, max: 1000)
 *   - offset: number (optional, default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    // Extract query parameters
    const url = new URL(request.url);
    const filters = {
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
      categoryId: url.searchParams.get("categoryId") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      offset: url.searchParams.get("offset") || undefined,
    };

    // Get transactions using service
    const transactions = await getTransactionsService(userId, filters);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
        filters: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          categoryId: filters.categoryId,
          limit: parseInt(filters.limit || "50"),
          offset: parseInt(filters.offset || "0"),
        },
      },
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch transactions");
  }
}

/**
 * POST /api/finance/transactions
 * Create a new transaction
 *
 * Body: {
 *   categoryId: string (required),
 *   amount: number (required),
 *   description?: string,
 *   transaction_date?: ISO date string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body",
        },
        { status: 400 },
      );
    }

    const { categoryId, amount, description, transaction_date } = body;

    // Basic validation
    if (!categoryId || amount === undefined || amount === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: categoryId, amount",
        },
        { status: 400 },
      );
    }

    // Prepare transaction data
    const transactionData = {
      categoryId,
      amount: parseFloat(amount),
      description,
      transaction_date: transaction_date
        ? parseTransactionDateInput(transaction_date)
        : undefined,
    };

    // Create transaction using service
    const newTransaction = await createTransactionService(
      userId,
      transactionData,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction: newTransaction,
        },
        message: "Transaction created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to create transaction");
  }
}
