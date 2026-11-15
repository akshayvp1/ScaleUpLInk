import { describe, expect, it } from "vitest";
import AdminModel from "../../src/models/adminModel";
import { BookingsModel } from "../../src/models/bookingModel";
import { Comment } from "../../src/models/commentModel";
import ConnectionModel from "../../src/models/connectionModel";
import DeviceTokenModel from "../../src/models/deviceTokenModel";
import { EventModel } from "../../src/models/eventModel";
import Group from "../../src/models/Group";
import GroupMessage from "../../src/models/GroupMessage";
import { Like } from "../../src/models/likeModel";
import Message from "../../src/models/Message";
import NotificationModel from "../../src/models/NotificationModel";
import { Post } from "../../src/models/postModel";
import { SeatModel } from "../../src/models/seatModel";
import { Share } from "../../src/models/shareModel";
import StoryModel from "../../src/models/storyModel";
import { StripeEventModel } from "../../src/models/stripeEventModel";
import UserModel from "../../src/models/userModel";

interface IndexedModel {
  schema: {
    indexes(): [Record<string, unknown>, Record<string, unknown>][];
  };
}

const hasIndex = (
  model: IndexedModel,
  fields: Record<string, number>,
  options: Record<string, unknown> = {}
) => {
  return model.schema.indexes().some(([keys, indexOptions]) => {
    const expectedKeys = Object.keys(fields);

    if (Object.keys(keys).length !== expectedKeys.length) {
      return false;
    }

    if (!expectedKeys.every((key) => keys[key] === fields[key])) {
      return false;
    }

    return Object.entries(options).every(
      ([key, value]) => indexOptions[key] === value
    );
  });
};

describe("Mongo index declarations", () => {
  it("enforces unique login identities", () => {
    expect(hasIndex(AdminModel, { email: 1 }, { unique: true })).toBe(true);
    expect(hasIndex(UserModel, { email: 1 }, { unique: true })).toBe(true);
    expect(hasIndex(UserModel, { role: 1, isActive: 1 })).toBe(true);
    expect(hasIndex(DeviceTokenModel, { token: 1 }, { unique: true })).toBe(true);
  });

  it("indexes event, booking, and seat access paths", () => {
    expect(hasIndex(EventModel, { eventStatus: 1, startDate: 1 })).toBe(true);
    expect(hasIndex(EventModel, { user_id: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(EventModel, { city: 1, startDate: 1 })).toBe(true);

    expect(hasIndex(BookingsModel, { bookingId: 1 }, { unique: true })).toBe(true);
    expect(hasIndex(BookingsModel, { stripeSessionId: 1 }, { unique: true })).toBe(
      true
    );
    expect(hasIndex(BookingsModel, { userId: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(BookingsModel, { userId: 1, paymentStatus: 1 })).toBe(true);
    expect(hasIndex(BookingsModel, { eventId: 1, paymentStatus: 1 })).toBe(true);
    expect(hasIndex(BookingsModel, { paymentStatus: 1, updatedAt: 1 })).toBe(true);

    expect(hasIndex(SeatModel, { eventId: 1, seatLabel: 1 }, { unique: true })).toBe(
      true
    );
    expect(hasIndex(SeatModel, { status: 1, holdExpiresAt: 1 })).toBe(true);
  });

  it("indexes chat, group, and connection access paths", () => {
    expect(hasIndex(Message, { senderId: 1, receiverId: 1, createdAt: 1 })).toBe(
      true
    );
    expect(hasIndex(Message, { receiverId: 1, seen: 1 })).toBe(true);
    expect(
      hasIndex(Message, { expiresAt: 1 }, { expireAfterSeconds: 0 })
    ).toBe(true);

    expect(hasIndex(Group, { members: 1, updatedAt: -1 })).toBe(true);
    expect(hasIndex(Group, { admin: 1 })).toBe(true);
    expect(hasIndex(GroupMessage, { groupId: 1, createdAt: 1 })).toBe(true);
    expect(
      hasIndex(GroupMessage, { expiresAt: 1 }, { expireAfterSeconds: 0 })
    ).toBe(true);

    expect(
      hasIndex(ConnectionModel, { requester: 1, recipient: 1 }, { unique: true })
    ).toBe(true);
    expect(
      hasIndex(ConnectionModel, { recipient: 1, status: 1, createdAt: -1 })
    ).toBe(true);
    expect(
      hasIndex(ConnectionModel, { requester: 1, status: 1, createdAt: -1 })
    ).toBe(true);
  });

  it("indexes notifications, stories, and engagement collections", () => {
    expect(
      hasIndex(NotificationModel, { recipient: 1, createdAt: -1 })
    ).toBe(true);
    expect(hasIndex(NotificationModel, { recipient: 1, isRead: 1 })).toBe(true);

    expect(hasIndex(StoryModel, { userId: 1, createdAt: -1 })).toBe(true);
    expect(
      hasIndex(StoryModel, { expiresAt: 1 }, { expireAfterSeconds: 0 })
    ).toBe(true);

    expect(hasIndex(Post, { userid: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(Post, { postTag: 1 })).toBe(true);
    expect(hasIndex(Post, { engagementScore: -1 })).toBe(true);
    expect(hasIndex(Like, { postId: 1, userId: 1 }, { unique: true })).toBe(true);
    expect(hasIndex(Comment, { postId: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(Share, { postId: 1, sharedAt: -1 })).toBe(true);
    expect(hasIndex(Share, { userId: 1, sharedAt: -1 })).toBe(true);
    expect(hasIndex(StripeEventModel, { eventId: 1 }, { unique: true })).toBe(true);
  });
});
