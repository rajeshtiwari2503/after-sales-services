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

// import mongoose, {
//   Schema,
//   model,
//   models,
// } from "mongoose";

// const warrantySchema = new Schema(
//   {
//     productName: String,

//     serialNumber: String,

//     purchaseDate: Date,

//     expiryDate: Date,

//     customerId: String,

//     status: String,
//   },
//   {
//     timestamps: true,
//   }
// );

// export default
//   models.Warranty ||
//   model(
//     "Warranty",
//     warrantySchema
//   );