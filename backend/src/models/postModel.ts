import mongoose, { Schema, Model, Types } from 'mongoose';
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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalShare: {
    type: Number,
    default: 0,
    min: 0
  },
  totalLikes: {
    type: Number,
    default: 0,
    min: 0
  },
  engagementScore: {
    type: Number,
    default: 0,
    min: 0
  },
  postTag: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  shares: [{
    sharedAt: {
      type: Date,
      default: Date.now
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
}, {
  timestamps: true,
  optimisticConcurrency: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexing for performance
PostSchema.index({ userid: 1, createdAt: -1 });
PostSchema.index({ postTag: 1 });
PostSchema.index({ engagementScore: -1 });

// Virtual for quick engagement calculation
PostSchema.virtual('engagement').get(function(this: IPost) {
  return {
    likes: this.totalLikes || 0,
    shares: this.totalShare || 0,
    comments: this.comments.length || 0
  };
});

// Pre-save hook to update engagement score
PostSchema.pre<IPost>('save', function(next) {
  this.engagementScore = (
    (this.totalLikes || 0) * 2 + 
    (this.comments.length || 0) * 3 + 
    (this.totalShare || 0) * 4
  );
  next();
});

// Method to add a comment
PostSchema.methods.addComment = function(userId: Types.ObjectId, commentText: string) {
  this.comments.push({
    _id: new mongoose.Types.ObjectId(),
    userId,
    commentText,
    createdAt: new Date()
  });
  return this.save();
};

// Method to like a post
PostSchema.methods.likePost = function(userId: Types.ObjectId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.totalLikes = this.likes.length;
  }
  return this.save();
};

export const Post = mongoose.model<IPost, PostModel>('Post', PostSchema);