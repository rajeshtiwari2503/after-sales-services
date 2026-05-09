 
     
   import mongoose, {
  Schema,
} from "mongoose";

const NotificationSchema =
  new Schema(
    {
      userId: {
        type: String,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: [
          "ticket",
          "chat",
          "sla",
          "system",
          "inventory",
          "billing",
             "SUCCESS",
        "WARNING",
        "ERROR",
        "INFO",
        ],
        default: "system",
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      actionUrl: {
        type: String,
      },

      metadata: {
        type: Object,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models
  .Notification ||
  mongoose.model(
    "Notification",
    NotificationSchema
  );