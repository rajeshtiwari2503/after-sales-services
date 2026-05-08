// import mongoose, {
//   Schema,
//   models,
// } from "mongoose";

// const SubscriptionSchema = new Schema(
//   {
//     tenantId: {
//       type: Schema.Types.ObjectId,
//       ref: "Tenant",
//     },

//     plan: {
//       type: String,
//       enum: [
//         "FREE",
//         "STARTER",
//         "PRO",
//         "ENTERPRISE",
//       ],
//     },

//     amount: Number,

//     billingCycle: {
//       type: String,
//       enum: ["MONTHLY", "YEARLY"],
//     },

//     status: {
//       type: String,
//       default: "ACTIVE",
//     },

//     nextBillingDate: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// const Subscription =
//   models.Subscription ||
//   mongoose.model(
//     "Subscription",
//     SubscriptionSchema
//   );

// export default Subscription;


import mongoose from "mongoose";

const SubscriptionSchema =
  new mongoose.Schema(
    {
      tenantId: String,

      plan: String,

      status: String,

      startDate: Date,

      endDate: Date,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models
  .Subscription ||
  mongoose.model(
    "Subscription",
    SubscriptionSchema
  );