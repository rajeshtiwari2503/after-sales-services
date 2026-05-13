 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

import { getAuthUser } from '@/lib/auth-helper';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // In production, upload to S3 or similar
    const url = `/uploads/${Date.now()}-${file.name}`;

    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      {
        $push: {
          attachments: {
            filename: file.name,
            url,
            type: file.type,
            size: file.size,
            uploadedBy: user.userId,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    const attachment = ticket.attachments[ticket.attachments.length - 1];
    return successResponse(attachment, 'Attachment uploaded successfully', 201);
  } catch (error) {
    console.error('Upload attachment error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findOne(
      { _id: id, tenantId: user.tenantId },
      { attachments: 1 }
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket.attachments);
  } catch (error) {
    console.error('Get attachments error:', error);
    return errorResponse('An error occurred', 500);
  }
}
