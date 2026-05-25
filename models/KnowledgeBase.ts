import mongoose, { Schema, Document, Model } from 'mongoose';

export interface KnowledgeBaseDocument extends Document {
  tenantId: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  authorId?: mongoose.Types.ObjectId;
  authorName?: string;
  relatedArticles: mongoose.Types.ObjectId[];
  attachments: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema<KnowledgeBaseDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true, default: 'general' },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    relatedArticles: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeBase' }],
    attachments: [{
      name: { type: String },
      url: { type: String },
    }],
  },
  { timestamps: true }
);

KnowledgeBaseSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
KnowledgeBaseSchema.index({ tenantId: 1, published: 1 });
KnowledgeBaseSchema.index({ tenantId: 1, category: 1 });
KnowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });

const KnowledgeBase: Model<KnowledgeBaseDocument> =
  mongoose.models.KnowledgeBase ||
  mongoose.model<KnowledgeBaseDocument>('KnowledgeBase', KnowledgeBaseSchema);

export default KnowledgeBase;