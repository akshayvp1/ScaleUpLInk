import mongoose, { Schema } from "mongoose";
import { IStory } from "../interfaces/IStory";


const StorySchema = new Schema<IStory>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: String, required: true },
    caption: { type: String, trim: true },
    viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    duration: { type: Number, required: true, default: 15 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const StoryModel = mongoose.model<IStory>("Story", StorySchema);
export default StoryModel;
