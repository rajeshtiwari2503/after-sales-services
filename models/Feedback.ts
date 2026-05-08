import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const feedbackSchema = new Schema(
  {
    ticketId: String,

    rating: Number,

    review: String,

    customerId: String,

    technicianId: String,
  },
  {
    timestamps: true,
  }
);

export default
  models.Feedback ||
  model(
    "Feedback",
    feedbackSchema
  );