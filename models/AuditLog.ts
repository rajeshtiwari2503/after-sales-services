import mongoose, {
  Schema,
  models,
} from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: String,

    module: String,

    metadata: Object,
  },
  {
    timestamps: true,
  }
);

const AuditLog =
  models.AuditLog ||
  mongoose.model(
    "AuditLog",
    AuditLogSchema
  );

export default AuditLog;