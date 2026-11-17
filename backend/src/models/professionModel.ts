import { Document, Schema, model } from "mongoose";

export interface IProfession extends Document {
  key: string;
  label: string;
  aliases: string[];
  isCustom: boolean;
  isActive: boolean;
  sortOrder: number;
}

const ProfessionSchema = new Schema<IProfession>(
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
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IProfession>("Profession", ProfessionSchema);
