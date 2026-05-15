import mongoose, { Schema, Document } from "mongoose";

export type WalletOwnerType = "service_center" | "technician";

export interface IWalletTransaction {
  type: "credit" | "debit" | "withdrawal";
  amount: number;
  description: string;
  commissionId?: mongoose.Types.ObjectId;
  ticketId?: mongoose.Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
}

export interface IWallet extends Document {
  ownerId: mongoose.Types.ObjectId;
  ownerType: WalletOwnerType;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  transactions: IWalletTransaction[];
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ["credit", "debit", "withdrawal"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    commissionId: { type: Schema.Types.ObjectId, ref: "Commission" },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket" },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WalletSchema = new Schema<IWallet>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true },
    ownerType: { type: String, enum: ["service_center", "technician"], required: true },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    transactions: [WalletTransactionSchema],
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    upiId: String,
  },
  { timestamps: true }
);

WalletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>("Wallet", WalletSchema);