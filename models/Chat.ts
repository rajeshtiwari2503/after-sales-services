import mongoose from "mongoose";

const ChatSchema =
  new mongoose.Schema(
    {
      ticketId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "Ticket",
      },

      sender: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "User",
      },

      message: String,

      attachments: [String],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models
  .Chat ||
  mongoose.model(
    "Chat",
    ChatSchema
  );