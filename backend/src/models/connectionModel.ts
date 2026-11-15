import mongoose, { Schema, model } from "mongoose";
import { IConnection } from "../interfaces/IConnection";

const ConnectionSchema: Schema = new Schema<IConnection>(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevents the same requester from spamming the same recipient with
// duplicate pending docs. (Doesn't stop the *reverse* pair — that's
// handled in the repository via findBetween() before creating.)
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
ConnectionSchema.index({ recipient: 1, status: 1, createdAt: -1 });
ConnectionSchema.index({ requester: 1, status: 1, createdAt: -1 });

const ConnectionModel = model<IConnection>("Connection", ConnectionSchema);

export default ConnectionModel;