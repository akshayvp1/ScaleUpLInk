import mongoose, { Schema, Model } from 'mongoose';
import { IPost, IPostMethods } from '../interfaces/IPost';

type PostModel = Model<IPost, {}, IPostMethods>;

const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  media: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^(https?:\/\/)/.test(v);
      },
      message: 'Media must be a valid URL'
    }
  }],
  totalShare: { type: Number, default: 0, min: 0 },
  totalLikes: { type: Number, default: 0, min: 0 },
  totalComments: { type: Number, default: 0, min: 0 },
  engagementScore: { type: Number, default: 0, min: 0 },
  postTag: [{
    type: String,
    trim: true,
    lowercase: true
  }],
}, {
  timestamps: true,
  optimisticConcurrency: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PostSchema.index({ userid: 1, createdAt: -1 });
PostSchema.index({ postTag: 1 });
PostSchema.index({ engagementScore: -1 });

PostSchema.virtual('engagement').get(function(this: IPost) {
  return {
    likes: this.totalLikes || 0,
    shares: this.totalShare || 0,
    comments: this.totalComments || 0
  };
});

export const Post = mongoose.model<IPost, PostModel>('Post', PostSchema);