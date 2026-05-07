import mongoose, {
  Schema,
  models,
} from "mongoose";

const TenantSchema = new Schema(
  {
    companyName: String,

    slug: {
      type: String,
      unique: true,
    },

    logo: String,

    domain: String,

    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant =
  models.Tenant ||
  mongoose.model("Tenant", TenantSchema);

export default Tenant;