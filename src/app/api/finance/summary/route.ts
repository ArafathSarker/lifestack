import { NextRequest, NextResponse } from "next/server";
import {
  getFinancialSummaryService,
  getRecentTransactionsService,
  ValidationError,
  ServiceError,
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

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/finance/summary
 * Get comprehensive financial summary for a user
 *
 * Query params:
 *   - period: 'current_month' | 'custom' (optional)
 *   - startDate: ISO date string (optional, for custom period)
 *   - endDate: ISO date string (optional, for custom period)
 *   - includeTransactions: 'true' | 'false' (optional, default: 'false')
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    // Extract query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get("period") as
      | "current_month"
      | "custom"
      | null;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const includeTransactions =
      url.searchParams.get("includeTransactions") === "true";

    // Prepare filters
    const filters = {
      period: period || undefined,
      startDate,
      endDate,
    };

    // Get financial summary using service
    const summaryData = await getFinancialSummaryService(userId, filters);

    // Optionally include recent transactions
    let recentTransactions;
    if (includeTransactions) {
      recentTransactions = await getRecentTransactionsService(userId, 10);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData.summary,
        categoryBreakdown: summaryData.categoryBreakdown,
        period: summaryData.period,
        ...(includeTransactions && { recentTransactions }),
      },
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch financial summary");
  }
}
