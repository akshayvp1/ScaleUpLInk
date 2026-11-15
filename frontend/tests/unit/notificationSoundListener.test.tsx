import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const handlers = new Map<string, Array<(payload?: unknown) => void>>();
  const socket = {
    on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    }),
    off: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      const list = handlers.get(event) ?? [];
      handlers.set(
        event,
        list.filter((entry) => entry !== handler)
      );
    }),
  };

  return { handlers, socket };
});

const sound = vi.hoisted(() => ({
  playNotificationSound: vi.fn(),
  stopNotificationSound: vi.fn(),
  unlockNotificationSound: vi.fn(),
}));

vi.mock("../../src/socket/socket", () => ({ socket: h.socket }));

vi.mock("../../src/redux/hooks", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        user: { _id: "user-me", name: "Me" },
        token: "token-me",
      },
    }),
}));

vi.mock("../../src/services/notification/notificationSound", () => sound);

import NotificationSoundListener from "../../src/components/basics/NotificationSoundListener";

function emit(event: string, payload: unknown) {
  (h.handlers.get(event) ?? []).forEach((handler) => handler(payload));
}

describe("NotificationSoundListener", () => {
  beforeEach(() => {
    h.handlers.clear();
    h.socket.on.mockClear();
    h.socket.off.mockClear();
    sound.playNotificationSound.mockClear();
    sound.stopNotificationSound.mockClear();
  });

  it("plays for direct and group messages from other users", () => {
    render(<NotificationSoundListener />);

    act(() => {
      emit("receive_message", { senderId: "user-other" });
      emit("receive_group_message", { senderId: "user-other" });
    });

    expect(sound.playNotificationSound).toHaveBeenCalledTimes(2);
  });

  it("ignores messages sent by the current user", () => {
    render(<NotificationSoundListener />);

    act(() => {
      emit("receive_message", { senderId: "user-me" });
      emit("receive_group_message", { senderId: "user-me" });
    });

    expect(sound.playNotificationSound).not.toHaveBeenCalled();
  });

  it("removes its socket listeners and stops audio on unmount", () => {
    const { unmount } = render(<NotificationSoundListener />);

    unmount();

    expect(sound.stopNotificationSound).toHaveBeenCalled();
    expect(h.socket.off).toHaveBeenCalledWith(
      "receive_message",
      expect.any(Function)
    );
    expect(h.socket.off).toHaveBeenCalledWith(
      "receive_group_message",
      expect.any(Function)
    );
  });
});
