// models/Contact.ts  — NEW FILE
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ContactDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  company: string;
  teamSize?: string;
  inquiryType?: string;
  message: string;
  referenceId: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  notes?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    phone:       { type: String, trim: true },
    company:     { type: String, required: true, trim: true },
    teamSize:    { type: String },
    inquiryType: { type: String },
    message:     { type: String, required: true },
    referenceId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    notes:     { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });

const Contact: Model<ContactDocument> =
  mongoose.models.Contact ||
  mongoose.model<ContactDocument>('Contact', ContactSchema);

export default Contact;