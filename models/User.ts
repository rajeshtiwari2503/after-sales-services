// import mongoose, { Schema, Document, models } from "mongoose";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
// }

// const UserSchema = new Schema<IUser>(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: [
//         "admin",
//         "brand",
//         "serviceCenter",
//         "technician",
//         "customer",
//       ],
//       default: "customer",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = models.User || mongoose.model<IUser>("User", UserSchema);

// export default User;


import mongoose, {
  Schema,
  models,
} from "mongoose";

const UserSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
    },

    name: String,

    email: {
      type: String,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

const User =
  models.User ||
  mongoose.model("User", UserSchema);

export default User;