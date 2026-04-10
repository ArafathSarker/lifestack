// =============================================================================
// SHARED UTILITIES FOR FINANCE API ROUTES
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  ValidationError,
  ServiceError,
  NotFoundError,
} from "@/lib/finance/services";

/**
 * Extract userId from request
 * In production, this would decode JWT token or get from session
 * For now, uses a mock userId for development
 */
export function getUserId(request: NextRequest): string {
  // Check for Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // TODO: In production, decode JWT token here
    // const token = authHeader.substring(7);
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return decoded.userId;

    // For development, return mock userId
    return "550e8400-e29b-41d4-a716-446655440000";
  }

  // Check for session cookie (if using session-based auth)
  const sessionCookie = request.cookies.get("session")?.value;
  if (sessionCookie) {
    // TODO: In production, decode session and extract userId
    // const session = decodeSession(sessionCookie);
    // return session.userId;

    // For development, return mock userId
    return "550e8400-e29b-41d4-a716-446655440000";
  }

  // Fallback mock userId for development
  return "550e8400-e29b-41d4-a716-446655440000";
}

/**
 * Standardized error response formatter
 * Handles different error types and returns appropriate HTTP status codes
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = "Internal server error",
): NextResponse {
  console.error("Finance API Error:", error);

  // Validation errors (400 Bad Request)
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

  // Not found errors (404 Not Found)
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 404 },
    );
  }

  // Service errors (500 Internal Server Error)
  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }

  // Unknown errors (500 Internal Server Error)
  return NextResponse.json(
    {
      success: false,
      error: defaultMessage,
    },
    { status: 500 },
  );
}

/**
 * Parse JSON body with error handling
 * Returns parsed body or null if parsing fails
 */
export async function parseJsonBody<T = unknown>(
  request: NextRequest,
): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ValidationError(["Invalid JSON body"]);
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[],
): void {
  const missingFields = requiredFields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === "",
  );

  if (missingFields.length > 0) {
    throw new ValidationError([
      `Missing required fields: ${missingFields.join(", ")}`,
    ]);
  }
}

/**
 * Create success response with standardized format
 */
export function createSuccessResponse(
  data: unknown,
  message?: string,
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status },
  );
}

/**
 * Extract and validate query parameters
 */
export function extractQueryParams(
  url: URL,
  allowedParams: string[],
): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};

  allowedParams.forEach((param) => {
    const value = url.searchParams.get(param);
    params[param] = value || undefined;
  });

  return params;
}

/**
 * Validate and parse numeric query parameter
 */
export function parseNumericParam(
  value: string | undefined,
  paramName: string,
  min?: number,
  max?: number,
): number | undefined {
  if (!value) return undefined;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ValidationError([`${paramName} must be a valid number`]);
  }

  if (min !== undefined && parsed < min) {
    throw new ValidationError([`${paramName} must be at least ${min}`]);
  }

  if (max !== undefined && parsed > max) {
    throw new ValidationError([`${paramName} cannot exceed ${max}`]);
  }

  return parsed;
}

/**
 * Validate and parse date parameter
 */
export function parseDateParam(
  value: string | undefined,
  paramName: string,
): Date | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new ValidationError([`${paramName} must be a valid ISO date string`]);
  }

  return parsed;
}

// =============================================================================
// TYPE DEFINITIONS FOR API RESPONSES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface FilteredResponse<T = unknown> {
  items: T[];
  count: number;
  filters: Record<string, unknown>;
}
