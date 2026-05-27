// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface ServiceCenterDocument extends Document {
//   name: string;
//   code: string;
//   tenantId: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country: string;
//     coordinates?: {
//       lat: number;
//       lng: number;
//     };
//   };
//   contact: {
//     phone: string;
//     email: string;
//     alternatePhone?: string;
//   };
//   managerId?: mongoose.Types.ObjectId;
//   workingHours: {
//     day: string;
//     isOpen: boolean;
//     openTime: string;
//     closeTime: string;
//   }[];
//   services: string[];
//   /** Additional pincodes this SC serves (6-digit or prefixes). */
//   servicePincodes: string[];
//   capacity: number;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ServiceCenterSchema = new Schema<ServiceCenterDocument>(
//   {
//     name: {
//       type: String,
//       required: [true, 'Service center name is required'],
//       trim: true,
//     },
//     code: {
//       type: String,
//       required: true,
//       uppercase: true,
//     },
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     address: {
//       street: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       postalCode: { type: String, required: true },
//       country: { type: String, required: true },
//       coordinates: {
//         lat: Number,
//         lng: Number,
//       },
//     },
//     contact: {
//       phone: { type: String, required: true },
//       email: { type: String, required: true },
//       alternatePhone: String,
//     },
//     managerId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     workingHours: [{
//       day: { type: String, required: true },
//       isOpen: { type: Boolean, default: true },
//       openTime: { type: String, default: '09:00' },
//       closeTime: { type: String, default: '18:00' },
//     }],
//     services: [{ type: String }],
//     servicePincodes: [{ type: String, trim: true }],
//     capacity: {
//       type: Number,
//       default: 10,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// ServiceCenterSchema.index({ tenantId: 1, code: 1 }, { unique: true });

// const ServiceCenter: Model<ServiceCenterDocument> =
//   mongoose.models.ServiceCenter || mongoose.model<ServiceCenterDocument>('ServiceCenter', ServiceCenterSchema);

// export default ServiceCenter;


import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ServiceCenterDocument extends Document {
  name: string;
  code: string;
  tenantId: string;

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  contact: {
    phone: string;
    email: string;
    alternatePhone?: string;
  };

  managerId?: mongoose.Types.ObjectId;

  workingHours: {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];

  services: string[];

  /** Additional pincodes this SC serves */
  servicePincodes: string[];

  capacity: number;
  isActive: boolean;

  /**
   * 🔐 Reset Password Fields
   */
  resetPasswordOTP?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ServiceCenterSchema = new Schema<ServiceCenterDocument>(
  {
    name: {
      type: String,
      required: [true, 'Service center name is required'],
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
    },

    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    address: {
      street: { type: String, required: true },

      city: { type: String, required: true },

      state: { type: String, required: true },

      postalCode: { type: String, required: true },

      country: { type: String, required: true },

      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    contact: {
      phone: { type: String, required: true },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      alternatePhone: String,
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    workingHours: [
      {
        day: { type: String, required: true },

        isOpen: { type: Boolean, default: true },

        openTime: { type: String, default: '09:00' },

        closeTime: { type: String, default: '18:00' },
      },
    ],

    services: [{ type: String }],

    servicePincodes: [{ type: String, trim: true }],

    capacity: {
      type: Number,
      default: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * 🔐 RESET PASSWORD FIELDS
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
  },
  {
    timestamps: true,
  }
);

ServiceCenterSchema.index(
  { tenantId: 1, code: 1 },
  { unique: true }
);

const ServiceCenter: Model<ServiceCenterDocument> =
  mongoose.models.ServiceCenter ||
  mongoose.model<ServiceCenterDocument>(
    'ServiceCenter',
    ServiceCenterSchema
  );

export default ServiceCenter;