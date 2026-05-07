import mongoose, {
  Schema,
  models,
} from "mongoose";

const KnowledgeBaseSchema = new Schema(
  {
    title: String,

    slug: String,

    category: String,

    content: String,

    tags: [String],

    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const KnowledgeBase =
  models.KnowledgeBase ||
  mongoose.model(
    "KnowledgeBase",
    KnowledgeBaseSchema
  );

export default KnowledgeBase;