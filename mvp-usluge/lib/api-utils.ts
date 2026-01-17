import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Standardizovani API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Validaciona greška",
      errors,
    },
    { status: 422 }
  );
}

/**
 * Centralizovani error handler
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  // Zod validaciona greška
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    return validationErrorResponse(errors);
  }

  // Prisma greške
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0] || "polje";
      return errorResponse(`${field} već postoji`, 409);
    }

    // Foreign key constraint violation
    if (error.code === "P2003") {
      return errorResponse("Referentni integritet narušen", 400);
    }

    // Record not found
    if (error.code === "P2025") {
      return errorResponse("Zapis nije pronađen", 404);
    }
  }

  // Generic error
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse("Nepoznata greška", 500);
}