 // models/Chat.ts  — REPLACE existing
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ChatDocument extends Document {
  ticketId:    mongoose.Types.ObjectId;
  sender:      mongoose.Types.ObjectId;
  message:     string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: string[];
  readBy:      mongoose.Types.ObjectId[];   // users who have read this message
  reactions:   { emoji: string; userId: mongoose.Types.ObjectId }[];
  isDeleted:   boolean;
  editedAt?:   Date;
  createdAt:   Date;
  updatedAt:   Date;
}

const ChatSchema = new Schema<ChatDocument>(
  {
    ticketId: {
      type:     Schema.Types.ObjectId,
      ref:      'Ticket',
      required: true,
      index:    true,
    },
    sender: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    message: {
      type:    String,
      default: '',
    },
    messageType: {
      type:    String,
      enum:    ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachments: [{ type: String }],
    readBy:      [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions:   [{
      emoji:  { type: String },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
    }],
    isDeleted: { type: Boolean, default: false },
    editedAt:  { type: Date },
  },
  { timestamps: true }
);

ChatSchema.index({ ticketId: 1, createdAt: 1 });

const Chat: Model<ChatDocument> =
  mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);

export default Chat;