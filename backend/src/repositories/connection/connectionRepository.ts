import { injectable } from "tsyringe";
import { Types } from "mongoose";

import ConnectionModel from "../../models/connectionModel";
import {
  IConnection,
  ConnectionStatus,
} from "../../interfaces/IConnection";

import { IConnectionRepository } from "./interface/IConnectionRepository";

@injectable()
class ConnectionRepository
  implements IConnectionRepository
{
  async findBetween(
    userA: string,
    userB: string
  ): Promise<IConnection | null> {
    const a = new Types.ObjectId(userA);
    const b = new Types.ObjectId(userB);

    return await ConnectionModel.findOne({
      $or: [
        {
          requester: a,
          recipient: b,
        },
        {
          requester: b,
          recipient: a,
        },
      ],
    });
  }

  async create(
    requesterId: string,
    recipientId: string
  ): Promise<IConnection> {
    const connection = new ConnectionModel({
      requester: new Types.ObjectId(requesterId),
      recipient: new Types.ObjectId(recipientId),
      status: "pending",
    });

    return await connection.save();
  }

  async findById(
    connectionId: string
  ): Promise<IConnection | null> {
    return await ConnectionModel.findById(
      connectionId
    );
  }

  async updateStatus(
    connectionId: string,
    status: ConnectionStatus
  ): Promise<IConnection | null> {
    return await ConnectionModel.findByIdAndUpdate(
      connectionId,
      {
        status,
      },
      {
        new: true,
      }
    );
  }

  async deleteById(
    connectionId: string
  ): Promise<void> {
    await ConnectionModel.findByIdAndDelete(
      connectionId
    );
  }

  async deleteBetween(
    userA: string,
    userB: string
  ): Promise<void> {
    const a = new Types.ObjectId(userA);
    const b = new Types.ObjectId(userB);

    await ConnectionModel.deleteOne({
      $or: [
        {
          requester: a,
          recipient: b,
        },
        {
          requester: b,
          recipient: a,
        },
      ],
    });
  }

  async getPendingForUser(
    userId: string
  ): Promise<IConnection[]> {
    return await ConnectionModel.find({
      recipient: new Types.ObjectId(userId),
      status: "pending",
    })
      .populate(
        "requester",
        "name profileImage profession"
      )
      .sort({
        createdAt: -1,
      });
  }

  async getAcceptedConnections(
    userId: string
  ): Promise<IConnection[]> {
    const id = new Types.ObjectId(userId);

    return await ConnectionModel.find({
      status: "accepted",
      $or: [
        {
          requester: id,
        },
        {
          recipient: id,
        },
      ],
    })
      .populate(
        "requester",
        "name profileImage profession"
      )
      .populate(
        "recipient",
        "name profileImage profession"
      )
      .sort({
        createdAt: -1,
      });
  }
}

export default ConnectionRepository;