 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File size exceeds 10MB limit', 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('File type not allowed', 400);
    }

    // In production, upload to S3 or cloud storage
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const url = `/uploads/${filename}`;

    return successResponse(
      {
        filename: file.name,
        url,
        type: file.type,
        size: file.size,
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('An error occurred', 500);
  }
}
