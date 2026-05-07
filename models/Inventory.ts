import mongoose, {
  Schema,
  models,
} from "mongoose";

const InventorySchema = new Schema(
  {
    partName: String,

    sku: String,

    quantity: Number,

    price: Number,

    lowStockThreshold: Number,

    warehouseLocation: String,
  },
  {
    timestamps: true,
  }
);

const Inventory =
  models.Inventory ||
  mongoose.model(
    "Inventory",
    InventorySchema
  );

export default Inventory;