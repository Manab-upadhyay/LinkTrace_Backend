import mongoose from "mongoose";
import { boolean } from "zod";
export interface ILink extends mongoose.Document {
  url: string;
  name: string;
  userId: mongoose.Types.ObjectId;
  shortCode: string;
  clicks: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const linkSchema = new mongoose.Schema<ILink>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for dashboard queries
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ userId: 1, clicks: -1 });

export default mongoose.model<ILink>("Link", linkSchema);
