import mongoose, {
  Schema,
  model,
} from "mongoose";

import {
  INotification,
} from "../interfaces/INotification";

const NotificationSchema =
  new Schema<INotification>(
    {
      recipient: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      sender: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      type: {
        type: String,

        enum: [
          "post_share",
          "like",
          "comment",
          "follow",
          "connection_request",
          "connection_accepted",
          "message",
        ],

        required: true,
      },

      post: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Post",
      },

      connection: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Connection",
      },

      group: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Group",
      },

      message: {
        type: String,

        required: true,

        trim: true,

        maxlength: 300,
      },

      isRead: {
        type: Boolean,

        default: false,

        index: true,
      },
    },

    {
      timestamps: true,
    }
  );


// Most recent notifications
NotificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

// Unread badge count
NotificationSchema.index({
  recipient: 1,
  isRead: 1,
});


const NotificationModel =
  model<INotification>(
    "Notification",
    NotificationSchema
  );

export default NotificationModel;