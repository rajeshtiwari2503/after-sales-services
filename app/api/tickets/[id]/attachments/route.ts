import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll('attachments') as File[];

    if (!files.length) return errorResponse('No files provided', 400);

    const userDoc = await User.findById(user.userId).select('name');

    // ⚠️ Yahan actual file upload karo — S3 / Cloudinary / local
    // Example ke liye mock URLs use kar rahe hain
    const attachments = files.map((f) => ({
      filename: f.name,
      url: `https://your-storage.com/uploads/${Date.now()}-${f.name}`, // replace with real upload
      type: f.type,
      size: f.size,
      uploadedBy: user.userId,
      uploadedAt: new Date(),
    }));

    const ticket = await Ticket.findOneAndUpdate(
      { _id: params.id, tenantId: user.tenantId },
      {
        $push: {
          attachments: { $each: attachments },
          timeline: {
            action: 'attachment_added',
            description: `${files.length} attachment(s) added`,
            performedBy: user.userId,
            performedByName: userDoc?.name ?? 'System',
          },
        },
      },
      { new: true }
    );

    if (!ticket) return errorResponse('Ticket not found', 404);

    return successResponse(ticket, 'Attachments uploaded');
  } catch (error) {
    console.error('Attachment upload error:', error);
    return errorResponse('Upload failed', 500);
  }
}