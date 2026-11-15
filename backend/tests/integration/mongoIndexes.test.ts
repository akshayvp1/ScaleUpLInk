import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose, { Model } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import AdminModel from "../../src/models/adminModel";
import { BookingsModel } from "../../src/models/bookingModel";
import ConnectionModel from "../../src/models/connectionModel";
import { EventModel } from "../../src/models/eventModel";
import Group from "../../src/models/Group";
import GroupMessage from "../../src/models/GroupMessage";
import Message from "../../src/models/Message";
import NotificationModel from "../../src/models/NotificationModel";
import { SeatModel } from "../../src/models/seatModel";
import StoryModel from "../../src/models/storyModel";
import UserModel from "../../src/models/userModel";

let mongo: MongoMemoryServer | undefined;

const models: Model<unknown>[] = [
  AdminModel,
  UserModel,
  EventModel,
  BookingsModel,
  SeatModel,
  Message,
  Group,
  GroupMessage,
  ConnectionModel,
  NotificationModel,
  StoryModel,
] as unknown as Model<unknown>[];

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "scaleup-link-index-test" });
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongo) {
    await mongo.stop();
  }
});

describe("Mongo index creation", () => {
  it("creates unique indexes declared by the models", async () => {
    for (const model of models) {
      await model.createIndexes();
    }

    const userIndexes = await UserModel.collection.indexes();
    const adminIndexes = await AdminModel.collection.indexes();
    const bookingIndexes = await BookingsModel.collection.indexes();
    const connectionIndexes = await ConnectionModel.collection.indexes();
    const seatIndexes = await SeatModel.collection.indexes();

    expect(userIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { email: 1 }, unique: true }),
      ])
    );
    expect(adminIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { email: 1 }, unique: true }),
      ])
    );
    expect(bookingIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { stripeSessionId: 1 }, unique: true }),
      ])
    );
    expect(connectionIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { requester: 1, recipient: 1 },
          unique: true,
        }),
      ])
    );
    expect(seatIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { eventId: 1, seatLabel: 1 },
          unique: true,
        }),
      ])
    );
  });

  it("creates TTL indexes for expiring chat and story data", async () => {
    const messageIndexes = await Message.collection.indexes();
    const groupMessageIndexes = await GroupMessage.collection.indexes();
    const storyIndexes = await StoryModel.collection.indexes();

    expect(messageIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }),
      ])
    );
    expect(groupMessageIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }),
      ])
    );
    expect(storyIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }),
      ])
    );
  });
});
