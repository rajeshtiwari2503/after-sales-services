import mongoose, { Schema, Document } from "mongoose";

export type JobStatus =
  | "assigned"
  | "on_the_way"
  | "reached"
  | "started"
  | "paused"
  | "completed"
  | "cancelled";

export interface IJobPhoto {
  url: string;
  caption?: string;
  stage: "before" | "during" | "after";
  uploadedAt: Date;
}

export interface IJobTimelog {
  status: JobStatus;
  changedAt: Date;
  note?: string;
  location?: { lat: number; lng: number };
}

export interface ITechnicianJob extends Document {
  ticketId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  serviceCenterId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  status: JobStatus;
  priority: "low" | "medium" | "high" | "critical";
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number;    // minutes
  pausedDuration: number;     // total paused minutes
  pauseStartedAt?: Date;
  partsUsed: {
    partId: mongoose.Types.ObjectId;
    partName: string;
    quantity: number;
    unitPrice: number;
  }[];
  laborCharge: number;
  partsCharge: number;
  totalCharge: number;
  photos: IJobPhoto[];
  timelogs: IJobTimelog[];
  technicianNotes?: string;
  customerSignature?: string; // base64 or URL
  otp?: string;               // customer OTP for job start
  otpVerified: boolean;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobPhotoSchema = new Schema<IJobPhoto>(
  {
    url: { type: String, required: true },
    caption: String,
    stage: { type: String, enum: ["before", "during", "after"], required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JobTimelogSchema = new Schema<IJobTimelog>(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: String,
    location: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const TechnicianJobSchema = new Schema<ITechnicianJob>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["assigned", "on_the_way", "reached", "started", "paused", "completed", "cancelled"],
      default: "assigned",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    scheduledAt: { type: Date, required: true },
    startedAt: Date,
    completedAt: Date,
    estimatedDuration: Number,
    actualDuration: Number,
    pausedDuration: { type: Number, default: 0 },
    pauseStartedAt: Date,
    partsUsed: [
      {
        partId: { type: Schema.Types.ObjectId, ref: "Part" },
        partName: String,
        quantity: Number,
        unitPrice: Number,
        _id: false,
      },
    ],
    laborCharge: { type: Number, default: 0 },
    partsCharge: { type: Number, default: 0 },
    totalCharge: { type: Number, default: 0 },
    photos: [JobPhotoSchema],
    timelogs: [JobTimelogSchema],
    technicianNotes: String,
    customerSignature: String,
    otp: String,
    otpVerified: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
  },
  { timestamps: true }
);

TechnicianJobSchema.pre<ITechnicianJob>("save", function (next) {
  this.partsCharge = this.partsUsed.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );
  this.totalCharge = this.laborCharge + this.partsCharge;
//   next();
});

TechnicianJobSchema.index({ technicianId: 1, status: 1 });
TechnicianJobSchema.index({ ticketId: 1 });
TechnicianJobSchema.index({ scheduledAt: 1 });

export default mongoose.models.TechnicianJob ||
  mongoose.model<ITechnicianJob>("TechnicianJob", TechnicianJobSchema);