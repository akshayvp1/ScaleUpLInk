import mongoose, {Schema } from "mongoose";
import { IMessage } from "../interfaces/IMessage";

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "sticker", "post"],
      default: "text",
    },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    postId: { type: String },
    postContent: { type: String, maxlength: 500 },
    postMedia: { type: String },
    postAuthorName: { type: String, maxlength: 120 },
    seen: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, seen: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);