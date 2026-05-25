import mongoose, { Schema, Document } from "mongoose";

export interface ICommission extends Document {
  ticketId: mongoose.Types.ObjectId;
  serviceCenterId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  totalJobValue: number;
  scCommissionRate: number;   // % brand pays to SC
  techCommissionRate: number; // % SC pays to technician
  scEarnings: number;
  techEarnings: number;
  platformFee: number;
  status: "pending" | "approved" | "paid" | "disputed";
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    totalJobValue: { type: Number, required: true, min: 0 },
    scCommissionRate: { type: Number, required: true, min: 0, max: 100 },
    techCommissionRate: { type: Number, required: true, min: 0, max: 100 },
    scEarnings: { type: Number, required: true, default: 0 },
    techEarnings: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "disputed"],
      default: "pending",
    },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

CommissionSchema.pre<ICommission>("save", function (next) {
  this.scEarnings = (this.totalJobValue * this.scCommissionRate) / 100;
  this.techEarnings = (this.scEarnings * this.techCommissionRate) / 100;
  this.platformFee = this.totalJobValue - this.scEarnings;
  // next();
});

CommissionSchema.index({ serviceCenterId: 1, status: 1 });
CommissionSchema.index({ technicianId: 1, status: 1 });

export default mongoose.models.Commission ||
  mongoose.model<ICommission>("Commission", CommissionSchema);