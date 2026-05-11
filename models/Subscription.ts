import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InvoiceDocument extends Document {
  invoiceNumber: string;
  tenantId: string;
  customerId: mongoose.Types.ObjectId;
  ticketId?: mongoose.Types.ObjectId;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    items: [{
      description: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true },
    }],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: Date,
    paymentMethod: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Invoice.countDocuments({ tenantId: this.tenantId });
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Invoice: Model<InvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);

export default Invoice;
