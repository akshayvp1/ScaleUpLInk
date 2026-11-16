import mongoose, { Schema } from "mongoose";
import { IGroupMessage } from "../interfaces/IGroupMessage";

const GroupMessageSchema = new Schema<IGroupMessage>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "sticker", "post", "event"],
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
    eventId: { type: String },
    eventTitle: { type: String, maxlength: 120 },
    eventImage: { type: String },
    eventStartDate: { type: String },
    eventStartTime: { type: String, maxlength: 5 },
    eventVenue: { type: String, maxlength: 200 },
    eventCity: { type: String, maxlength: 100 },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

GroupMessageSchema.index({ groupId: 1, createdAt: 1 });
GroupMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IGroupMessage>("GroupMessage", GroupMessageSchema);