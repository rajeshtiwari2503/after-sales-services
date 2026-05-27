 
// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface TechnicianDocument extends Document {
//   userId: mongoose.Types.ObjectId;
//   tenantId: string;
//   serviceCenterId: mongoose.Types.ObjectId;   // ← required now
//   employeeId: string;
//   specializations: string[];
//   certifications: {
//     name: string;
//     issuedBy: string;
//     issuedDate: Date;
//     expiryDate?: Date;
//   }[];
//   availability: {
//     isAvailable: boolean;
//     workingHours: { day: string; start: string; end: string }[];
//   };
//   rating: number;
//   totalTickets: number;
//   completedTickets: number;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const TechnicianSchema = new Schema<TechnicianDocument>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     // Every technician MUST belong to exactly one service center
//     serviceCenterId: {
//       type: Schema.Types.ObjectId,
//       ref: 'ServiceCenter',
//       required: [true, 'Technician must belong to a service center'],
//       index: true,
//     },
//     employeeId: {
//       type: String,
//       required: true,
//     },
//     specializations: [{ type: String }],
//     certifications: [
//       {
//         name: { type: String, required: true },
//         issuedBy: { type: String, required: true },
//         issuedDate: { type: Date, required: true },
//         expiryDate: Date,
//       },
//     ],
//     availability: {
//       isAvailable: { type: Boolean, default: true },
//       workingHours: [{ day: String, start: String, end: String }],
//     },
//     rating: { type: Number, default: 0, min: 0, max: 5 },
//     totalTickets: { type: Number, default: 0 },
//     completedTickets: { type: Number, default: 0 },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// TechnicianSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
// TechnicianSchema.index({ tenantId: 1, serviceCenterId: 1 });

// const Technician: Model<TechnicianDocument> =
//   mongoose.models.Technician ||
//   mongoose.model<TechnicianDocument>('Technician', TechnicianSchema);

// export default Technician;


import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface TechnicianDocument extends Document {
  userId: mongoose.Types.ObjectId;

  tenantId: string;

  serviceCenterId: mongoose.Types.ObjectId;

  employeeId: string;

  specializations: string[];

  certifications: {
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
  }[];

  availability: {
    isAvailable: boolean;
    workingHours: {
      day: string;
      start: string;
      end: string;
    }[];
  };

  /**
   * AUTH
   */
  email?: string;
  password?: string;

  /**
   * RESET PASSWORD
   */
  resetPasswordOTP?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  rating: number;

  totalTickets: number;
  completedTickets: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSchema =
  new Schema<TechnicianDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      tenantId: {
        type: String,
        required: true,
        index: true,
      },

      /**
       * EACH TECHNICIAN
       * BELONGS TO SERVICE CENTER
       */
      serviceCenterId: {
        type: Schema.Types.ObjectId,
        ref: "ServiceCenter",
        required: [
          true,
          "Technician must belong to a service center",
        ],
        index: true,
      },

      employeeId: {
        type: String,
        required: true,
      },

      /**
       * LOGIN
       */
      email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        sparse: true,
      },

      password: {
        type: String,
        select: false,
      },

      /**
       * RESET PASSWORD
       */
      resetPasswordOTP: {
        type: String,
        select: false,
      },

      resetPasswordToken: {
        type: String,
        select: false,
      },

      resetPasswordExpiry: {
        type: Date,
        select: false,
      },

      specializations: [{ type: String }],

      certifications: [
        {
          name: {
            type: String,
            required: true,
          },

          issuedBy: {
            type: String,
            required: true,
          },

          issuedDate: {
            type: Date,
            required: true,
          },

          expiryDate: Date,
        },
      ],

      availability: {
        isAvailable: {
          type: Boolean,
          default: true,
        },

        workingHours: [
          {
            day: String,
            start: String,
            end: String,
          },
        ],
      },

      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      totalTickets: {
        type: Number,
        default: 0,
      },

      completedTickets: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

TechnicianSchema.index(
  {
    tenantId: 1,
    employeeId: 1,
  },
  {
    unique: true,
  }
);

TechnicianSchema.index({
  tenantId: 1,
  serviceCenterId: 1,
});

const Technician: Model<TechnicianDocument> =
  mongoose.models.Technician ||
  mongoose.model<TechnicianDocument>(
    "Technician",
    TechnicianSchema
  );

export default Technician;