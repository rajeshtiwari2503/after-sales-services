 import mongoose, {
  Schema,
} from "mongoose";

const FeedbackSchema =
  new Schema(
    {
      ticketId: {
        type: String,
        required: true,
      },

      customerId: {
        type: String,
        required: true,
      },

      customerName: {
        type: String,
        required: true,
      },

      rating: {
        type: Number,
        required: true,
      },

      serviceQuality: {
        type: Number,
      },

      technicianBehavior: {
        type: Number,
      },

      responseTime: {
        type: Number,
      },

      recommendationLikelihood:
        {
          type: Number,
        },

      feedbackMessage: {
        type: String,
      },

      suggestions: {
        type: String,
      },

      resolved: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models
  .Feedback ||
  mongoose.model(
    "Feedback",
    FeedbackSchema
  );