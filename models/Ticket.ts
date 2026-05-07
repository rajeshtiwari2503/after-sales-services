import mongoose, {
  Schema,
  models,
} from "mongoose";

const TicketSchema = new Schema(
  {
    title: String,
    description: String,

    status: {
      type: String,
      default: "OPEN",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    technician: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Ticket =
  models.Ticket ||
  mongoose.model("Ticket", TicketSchema);

export default Ticket;