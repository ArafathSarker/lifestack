import { NextRequest, NextResponse } from "next/server";
import {
  updateTransactionService,
  deleteTransactionService,
  ValidationError,
  ServiceError,
  NotFoundError,
} from "@/lib/finance/services";
import type { TransactionData } from "@/lib/finance/queries";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateTransactionBody = {
  categoryId?: string;
  amount?: number | string;
  description?: string | null;
  transaction_date?: string;
};

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
 * PUT /api/finance/transactions/[id]
 * Update an existing transaction
 *
 * Body: {
 *   categoryId?: string,
 *   amount?: number,
 *   description?: string,
 *   transaction_date?: ISO date string
 * }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserId(request);
    const { id: transactionId } = await context.params;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required",
        },
        { status: 400 },
      );
    }

    // Parse request body
    let body: UpdateTransactionBody;
    try {
      body = (await request.json()) as UpdateTransactionBody;
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

    // Prepare update data (only include provided fields)
    const updateData: Partial<TransactionData> = {};

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }

    if (amount !== undefined) {
      updateData.amount =
        typeof amount === "number" ? amount : parseFloat(amount);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (transaction_date !== undefined) {
      updateData.transaction_date = parseTransactionDateInput(transaction_date);
    }

    // Update transaction using service
    const updatedTransaction = await updateTransactionService(
      transactionId,
      userId,
      updateData,
    );

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction,
      },
      message: "Transaction updated successfully",
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to update transaction");
  }
}

/**
 * DELETE /api/finance/transactions/[id]
 * Delete an existing transaction
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserId(request);
    const { id: transactionId } = await context.params;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required",
        },
        { status: 400 },
      );
    }

    // Delete transaction using service
    await deleteTransactionService(transactionId, userId);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to delete transaction");
  }
}
