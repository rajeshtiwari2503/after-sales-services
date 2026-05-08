import mongoose from "mongoose";

const InvoiceSchema =
  new mongoose.Schema(
    {
      tenantId: String,

      amount: Number,

      status: String,

      invoiceNumber:
        String,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models
  .Invoice ||
  mongoose.model(
    "Invoice",
    InvoiceSchema
  );