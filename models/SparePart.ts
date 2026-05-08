import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const sparePartSchema = new Schema(
  {
    partName: String,

    sku: String,

    stock: Number,

    price: Number,

    vendor: String,
  },
  {
    timestamps: true,
  }
);

export default
  models.SparePart ||
  model(
    "SparePart",
    sparePartSchema
  );