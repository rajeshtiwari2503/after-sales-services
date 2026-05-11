import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message = 'Success'
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  });
}
