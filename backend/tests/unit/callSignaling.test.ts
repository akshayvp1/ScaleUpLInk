import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { container } from "tsyringe";

const h = vi.hoisted(() => {
  const redisMock = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  };

  const userFindById = vi.fn();
  const userFind = vi.fn();
  const userFindByIdAndUpdate = vi.fn();
  const verifyAccessToken = vi.fn();

  class ChatService {}
  class GroupService {}
  class ConnectionService {}
  class NotificationService {}

  const chatService = {
    saveMessage: vi.fn(),
    markSeen: vi.fn(),
  };
  const groupService = {
    getGroupsForUser: vi.fn(),
    getGroupMemberIds: vi.fn(),
    getGroupById: vi.fn(),
  };
  const connectionService = {
    areConnected: vi.fn(),
  };
  const notificationService = {
    notifyMessage: vi.fn(),
  };

  return {
    redisMock,
    userFindById,
    userFind,
    userFindByIdAndUpdate,
    verifyAccessToken,
    ChatService,
    GroupService,
    ConnectionService,
    NotificationService,
    chatService,
    groupService,
    connectionService,
    notificationService,
  };
});

vi.mock("../../src/config/redisConfig", () => ({ default: h.redisMock }));
vi.mock("../../src/models/adminModel", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("../../src/models/userModel", () => ({
  default: {
    findById: h.userFindById,
    find: h.userFind,
    findByIdAndUpdate: h.userFindByIdAndUpdate,
  },
}));
vi.mock("../../src/utils/jwt", () => ({
  verifyAccessToken: h.verifyAccessToken,
}));
vi.mock("../../src/services/chat/chatService", () => ({
  default: h.ChatService,
}));
vi.mock("../../src/services/chat/groupService", () => ({
  default: h.GroupService,
}));
vi.mock("../../src/services/connection/connectionService", () => ({
  default: h.ConnectionService,
}));
vi.mock("../../src/services/notification/notificationService", () => ({
  default: h.NotificationService,
}));

import ChatService from "../../src/services/chat/chatService";
import GroupService from "../../src/services/chat/groupService";
import ConnectionService from "../../src/services/connection/connectionService";
import NotificationService from "../../src/services/notification/notificationService";
import { initializeSocket } from "../../src/socket/socket";

type Handler = (payload?: unknown) => unknown;

class FakeSocket {
  id: string;
  handshake: { auth: { token: string }; query: Record<string, string> };
  joined = new Set<string>();
  emitted: Array<{ event: string; payload: unknown }> = [];
  private handlers = new Map<string, Handler[]>();

  constructor(id: string, token: string) {
    this.id = id;
    this.handshake = { auth: { token }, query: {} };
  }

  join(room: string) {
    this.joined.add(room);
  }

  leave(room: string) {
    this.joined.delete(room);
  }

  on(event: string, handler: Handler) {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  emit(event: string, payload?: unknown) {
    this.emitted.push({ event, payload });
  }

  disconnect() {}

  async trigger(event: string, payload?: unknown) {
    for (const handler of this.handlers.get(event) ?? []) {
      await handler(payload);
    }
  }

  received(event: string): Array<Record<string, unknown>> {
    return this.emitted
      .filter((entry) => entry.event === event)
      .map((entry) => entry.payload as Record<string, unknown>);
  }

  clearEmitted() {
    this.emitted = [];
  }
}

function createIo() {
  const sockets = new Map<string, FakeSocket>();
  let connectionHandler: ((socket: FakeSocket) => Promise<void>) | undefined;

  const io = {
    on: (event: string, handler: (socket: FakeSocket) => Promise<void>) => {
      if (event === "connection") connectionHandler = handler;
    },
    to: (room: string) => ({
      emit: (event: string, payload?: unknown) => {
        sockets.forEach((socket) => {
          if (socket.joined.has(room)) socket.emit(event, payload);
        });
      },
    }),
    emit: (event: string, payload?: unknown) => {
      sockets.forEach((socket) => socket.emit(event, payload));
    },
  };

  return {
    io,
    sockets,
    connect: async (socket: FakeSocket) => {
      sockets.set(socket.id, socket);
      if (!connectionHandler) throw new Error("Connection handler not set");
      await connectionHandler(socket);
    },
  };
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("WebRTC call signaling", () => {
  let env: ReturnType<typeof createIo>;
  let caller: FakeSocket;
  let callee: FakeSocket;

  beforeEach(async () => {
    vi.clearAllMocks();

    h.redisMock.get.mockResolvedValue("1");
    h.redisMock.set.mockResolvedValue("OK");
    h.redisMock.del.mockResolvedValue(1);
    h.redisMock.keys.mockResolvedValue([]);

    h.verifyAccessToken.mockImplementation(async (token: string) => ({
      id: token === "token-caller" ? "user-caller" : "user-callee",
      role: "entrepreneur",
    }));

    h.userFindById.mockImplementation((id: string) => ({
      select: () => ({
        lean: async () => ({
          name: id === "user-caller" ? "Caller" : "Callee",
          isActive: true,
        }),
      }),
    }));

    h.userFind.mockImplementation(
      (query: { _id: { $in: string[] } }) => ({
        select: () => ({
          lean: async () => {
            const ids = query?._id?.$in ?? [];
            return ids.map((id) => ({
              _id: id,
              name: id === "user-caller" ? "Caller" : "Callee",
            }));
          },
        }),
      })
    );

    h.userFindByIdAndUpdate.mockResolvedValue(null);
    h.chatService.saveMessage.mockResolvedValue({});
    h.chatService.markSeen.mockResolvedValue([]);
    h.groupService.getGroupsForUser.mockResolvedValue([]);
    h.groupService.getGroupMemberIds.mockResolvedValue([]);
    h.groupService.getGroupById.mockResolvedValue(null);
    h.connectionService.areConnected.mockResolvedValue(true);
    h.notificationService.notifyMessage.mockResolvedValue(undefined);

    container.register(ChatService, { useValue: h.chatService });
    container.register(GroupService, { useValue: h.groupService });
    container.register(ConnectionService, {
      useValue: h.connectionService,
    });
    container.register(NotificationService, {
      useValue: h.notificationService,
    });

    env = createIo();
    initializeSocket(env.io as never);

    caller = new FakeSocket("socket-caller", "token-caller");
    callee = new FakeSocket("socket-callee", "token-callee");
    await env.connect(caller);
    await env.connect(callee);

    caller.clearEmitted();
    callee.clearEmitted();
  });

  it("notifies the callee and connects the call on accept", async () => {
    await caller.trigger("call_start", {
      callId: "call-1",
      callType: "audio",
      targetUserId: "user-callee",
    });
    await flush();

    expect(callee.received("call_incoming")).toEqual([
      expect.objectContaining({
        callId: "call-1",
        callType: "audio",
        callerId: "user-caller",
        callerName: "Caller",
      }),
    ]);
    expect(caller.received("call_created")).toEqual([
      expect.objectContaining({ callId: "call-1", callType: "audio" }),
    ]);

    await callee.trigger("call_accept", { callId: "call-1" });
    await flush();

    expect(callee.received("call_joined")).toEqual([
      expect.objectContaining({
        callId: "call-1",
        callType: "audio",
        participants: [{ userId: "user-caller", name: "Caller" }],
      }),
    ]);
    expect(caller.received("call_peer_joined")).toEqual([
      expect.objectContaining({
        callId: "call-1",
        userId: "user-callee",
        name: "Callee",
      }),
    ]);
  });

  it("reports a media failure without treating it as a rejection", async () => {
    await caller.trigger("call_start", {
      callId: "call-media",
      callType: "video",
      targetUserId: "user-callee",
    });
    await flush();

    await callee.trigger("call_media_failed", {
      callId: "call-media",
      reason: "permission_denied",
    });
    await flush();

    expect(caller.received("call_rejected")).toEqual([]);
    expect(caller.received("call_failed")).toEqual([
      expect.objectContaining({
        callId: "call-media",
        callType: "video",
        userId: "user-callee",
        name: "Callee",
        reason: "permission_denied",
      }),
    ]);
  });

  it("still reports explicit rejections as rejections", async () => {
    await caller.trigger("call_start", {
      callId: "call-reject",
      callType: "audio",
      targetUserId: "user-callee",
    });
    await flush();

    await callee.trigger("call_reject", { callId: "call-reject" });
    await flush();

    expect(caller.received("call_rejected")).toEqual([
      expect.objectContaining({
        callId: "call-reject",
        userId: "user-callee",
      }),
    ]);
    expect(caller.received("call_failed")).toEqual([]);
  });
});
