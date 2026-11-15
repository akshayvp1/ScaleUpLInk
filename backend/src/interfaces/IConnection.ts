import { Document, Types } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface IConnection extends Document {
  _id: Types.ObjectId;
  requester: Types.ObjectId; // the user who clicked "Connect"
  recipient: Types.ObjectId; // the user who has to accept/ignore
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}