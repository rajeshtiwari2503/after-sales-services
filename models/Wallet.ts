 // models/Wallet.ts  — REPLACE existing
import mongoose, { Schema, Document } from 'mongoose';

export type WalletOwnerType = 'service_center' | 'brand';

export interface IWithdrawalRequest {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  method: 'bank' | 'upi';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  upiId?: string;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface IWalletTransaction {
  _id?: mongoose.Types.ObjectId;
  type: 'credit' | 'debit' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  ticketId?: mongoose.Types.ObjectId;
  ticketNumber?: string;
  referenceId?: string;           // withdrawal request ID or manual credit ID
  balanceAfter: number;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IWallet extends Document {
  ownerId: mongoose.Types.ObjectId;   // ServiceCenter._id or Brand's manager User._id
  ownerType: WalletOwnerType;
  tenantId: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;              // sum of pending withdrawal requests
  ticketRate: number;                 // ₹ credited per resolved ticket (set by admin)
  transactions: IWalletTransaction[];
  withdrawalRequests: IWithdrawalRequest[];
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TxSchema = new Schema<IWalletTransaction>(
  {
    type:         { type: String, enum: ['credit','debit','withdrawal','refund'], required: true },
    amount:       { type: Number, required: true },
    description:  { type: String, required: true },
    ticketId:     { type: Schema.Types.ObjectId, ref: 'Ticket' },
    ticketNumber: { type: String },
    referenceId:  { type: String },
    balanceAfter: { type: Number, required: true },
    performedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WithdrawalSchema = new Schema<IWithdrawalRequest>(
  {
    amount:          { type: Number, required: true },
    method:          { type: String, enum: ['bank','upi'], required: true },
    status:          { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    requestedAt:     { type: Date, default: Date.now },
    processedAt:     { type: Date },
    processedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    upiId:           { type: String },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode:      String,
      bankName:      String,
    },
  }
);

const WalletSchema = new Schema<IWallet>(
  {
    ownerId:       { type: Schema.Types.ObjectId, required: true },
    ownerType:     { type: String, enum: ['service_center','brand'], required: true },
    tenantId:      { type: String, required: true, index: true },
    balance:       { type: Number, default: 0, min: 0 },
    totalEarned:   { type: Number, default: 0 },
    totalWithdrawn:{ type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    ticketRate:    { type: Number, default: 500 },   // ₹500 per resolved ticket default
    transactions:       [TxSchema],
    withdrawalRequests: [WithdrawalSchema],
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode:      String,
      bankName:      String,
    },
    upiId:    { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WalletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
WalletSchema.index({ tenantId: 1 });

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>('Wallet', WalletSchema);