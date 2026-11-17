import { Document, Schema, model } from "mongoose";

export interface IInterest extends Document {
  key: string;
  label: string;
  aliases: string[];
  isActive: boolean;
  sortOrder: number;
}

const InterestSchema = new Schema<IInterest>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: { type: String, required: true, trim: true },
    aliases: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IInterest>("Interest", InterestSchema);
