// import mongoose, {
//   Schema,
//   models,
// } from "mongoose";

// const AuditLogSchema = new Schema(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },

//     action: String,

//     module: String,

//     metadata: Object,
//   },
//   {
//     timestamps: true,
//   }
// );

// const AuditLog =
//   models.AuditLog ||
//   mongoose.model(
//     "AuditLog",
//     AuditLogSchema
//   );

// export default AuditLog;


import mongoose from "mongoose";

const schema =
  new mongoose.Schema(
    {
      action: String,

      entity: String,

      entityId: String,

      userId: String,

      payload: Object,
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models
    .AuditLog ||
  mongoose.model(
    "AuditLog",
    schema
  );