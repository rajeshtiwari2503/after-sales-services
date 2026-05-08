import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const notificationSchema = new Schema(
  {
    title: String,

    message: String,

    userId: String,

    type: {
      type: String,
      enum: [
        "SUCCESS",
        "WARNING",
        "ERROR",
        "INFO",
      ],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default
  models.Notification ||
  model(
    "Notification",
    notificationSchema
  );