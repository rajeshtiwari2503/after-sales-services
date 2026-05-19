//  import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ ticketId: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { ticketId } = await params;

//     // Get messages for ticket
//     // In production, fetch from database
//     return successResponse({
//       ticketId,
//       messages: [],
//       participants: [],
//     });
//   } catch (error) {
//     console.error('Get ticket chat error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }
 

import { NextRequest } from "next/server";
import { Types } from "mongoose";

import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getAuthUser } from "@/lib/auth-helper";

import Chat from "@/models/Chat";
import connectDB from "@/lib/db";

// ======================
// GET CHAT MESSAGES
// ======================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid ticket id", 400);
    }

    const messages = await Chat.find({
      ticketId: new Types.ObjectId(id),
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 })
      .lean();

    const formatted = messages.map((message: any) => ({
      _id: message._id?.toString(),
      senderId:
        message.sender?._id?.toString() ||
        message.sender?.toString(),

      senderName:
        message.sender?.name || "Unknown",

      senderRole:
        message.sender?.role || "unknown",

      content: message.message,

      attachments:
        message.attachments || [],

      createdAt: message.createdAt,
    }));

    return successResponse(
      { messages: formatted },
      "Messages fetched successfully"
    );
  } catch (error) {
    console.error("[CHAT_GET_ERROR]", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// SEND MESSAGE
// ======================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid ticket id", 400);
    }

    const body = await request.json();

    const message = body?.message?.trim();

    if (!message) {
      return errorResponse(
        "Message content required",
        400
      );
    }

    const chat = await Chat.create({
      ticketId: new Types.ObjectId(id),

      sender: new Types.ObjectId(user.userId),

      message,
    });

    await chat.populate("sender", "name role");

    const formatted = {
      _id: chat._id?.toString(),

      senderId: user.userId,

      senderName:
        (chat as any)?.sender?.name ||
        "Unknown",

      senderRole:
        (chat as any)?.sender?.role ||
        "unknown",

      content: chat.message,

      attachments:
        chat.attachments || [],

      createdAt: chat.createdAt,
    };

    return successResponse(
      formatted,
      "Message sent successfully",
      201
    );
  } catch (error) {
    console.error("[CHAT_POST_ERROR]", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}