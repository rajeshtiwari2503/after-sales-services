import mongoose, {
  Schema,
  models,
} from "mongoose";

const ServiceCenterSchema = new Schema(
  {
    companyName: String,

    email: String,

    phone: String,

    address: String,

    city: String,

    state: String,

    pincode: String,

    coverageArea: [String],

    supportedBrands: [String],

    technicians: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const ServiceCenter =
  models.ServiceCenter ||
  mongoose.model(
    "ServiceCenter",
    ServiceCenterSchema
  );

export default ServiceCenter;