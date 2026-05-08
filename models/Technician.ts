import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const technicianSchema = new Schema(
  {
    name: String,

    email: String,

    phone: String,

    skills: [String],

    status: {
      type: String,
      default: "AVAILABLE",
    },

    rating: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default
  models.Technician ||
  model(
    "Technician",
    technicianSchema
  )