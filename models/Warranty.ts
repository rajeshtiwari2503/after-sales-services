import mongoose, {
  Schema,
  models,
} from "mongoose";

const WarrantySchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    productName: String,

    serialNumber: String,

    purchaseDate: Date,

    expiryDate: Date,

    warrantyType: String,

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Warranty =
  models.Warranty ||
  mongoose.model(
    "Warranty",
    WarrantySchema
  );

export default Warranty;