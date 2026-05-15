import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "file" | "audio" | "system";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readBy: { userId: mongoose.Types.ObjectId; readAt: Date }[];
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderAvatar: String,
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "system"],
      default: "text",
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    isRead: { type: Boolean, default: false },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    replyTo: { type: Schema.Types.ObjectId, ref: "ChatMessage" },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);