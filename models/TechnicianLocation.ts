import mongoose, {
  Schema,
  models,
} from "mongoose";

const TechnicianLocationSchema =
  new Schema(
    {
      technicianId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      latitude: Number,

      longitude: Number,

      accuracy: Number,
    },
    {
      timestamps: true,
    }
  );

const TechnicianLocation =
  models.TechnicianLocation ||
  mongoose.model(
    "TechnicianLocation",
    TechnicianLocationSchema
  );

export default TechnicianLocation;