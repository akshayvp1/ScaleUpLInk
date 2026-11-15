import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IncomingCall } from "../../src/types/call/call.types";

const h = vi.hoisted(() => {
  const handlers = new Map<string, Array<(payload?: unknown) => void>>();
  const socket = {
    connected: true,
    auth: { token: "" },
    connect: vi.fn(),
    disconnect: vi.fn(),
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
    emit: vi.fn(),
  };

  return { handlers, socket };
});

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

vi.mock("react-hot-toast", () => {
  const toastFn = Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  });

  return { toast: toastFn };
});

vi.mock("../../src/components/call/IncomingCallModal", () => ({
  default: () => null,
}));
vi.mock("../../src/components/call/CallOverlay", () => ({
  default: () => null,
}));

import CallProvider from "../../src/components/call/CallProvider";
import { useCall } from "../../src/context/call/callContext";

function Harness() {
  const { incomingCall, acceptCall } = useCall();

  return (
    <div>
      <span data-testid="incoming">{incomingCall?.callId ?? "none"}</span>
      <button type="button" onClick={() => void acceptCall()}>
        accept-call
      </button>
    </div>
  );
}

const getUserMedia = vi.fn();

function makeIncoming(callId: string, callType: "audio" | "video"): IncomingCall {
  return {
    callId,
    callType,
    isGroup: false,
    callerId: "user-other",
    callerName: "Other",
  };
}

async function deliverIncoming(payload: IncomingCall) {
  await act(async () => {
    (h.handlers.get("call_incoming") ?? []).forEach((handler) =>
      handler(payload)
    );
  });
}

function mediaError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

describe("call media permissions", () => {
  beforeEach(() => {
    h.handlers.clear();
    h.socket.emit.mockClear();
    h.socket.on.mockClear();
    h.socket.off.mockClear();
    getUserMedia.mockReset();

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
  });

  it.each(["audio", "video"] as const)(
    "reports a %s permission failure as a media error, not a rejection",
    async (callType) => {
      getUserMedia.mockRejectedValue(mediaError("NotAllowedError"));

      render(
        <CallProvider>
          <Harness />
        </CallProvider>
      );

      await deliverIncoming(makeIncoming("call-permission", callType));
      expect(screen.getByTestId("incoming")).toHaveTextContent(
        "call-permission"
      );

      await userEvent.click(
        screen.getByRole("button", { name: "accept-call" })
      );

      await waitFor(() => {
        expect(h.socket.emit).toHaveBeenCalledWith("call_media_failed", {
          callId: "call-permission",
          reason: "permission_denied",
        });
      });

      expect(h.socket.emit).not.toHaveBeenCalledWith(
        "call_reject",
        expect.anything()
      );
      expect(screen.getByTestId("incoming")).toHaveTextContent("none");
      expect(toast.error).toHaveBeenCalled();
    }
  );

  it("reports the device-specific error for a missing microphone", async () => {
    getUserMedia.mockRejectedValue(mediaError("NotFoundError"));

    render(
      <CallProvider>
        <Harness />
      </CallProvider>
    );

    await deliverIncoming(makeIncoming("call-missing-mic", "audio"));
    await userEvent.click(screen.getByRole("button", { name: "accept-call" }));

    await waitFor(() => {
      expect(h.socket.emit).toHaveBeenCalledWith("call_media_failed", {
        callId: "call-missing-mic",
        reason: "device_unavailable",
      });
    });

    expect(toast.error).toHaveBeenCalledWith(
      "No microphone was found on this device."
    );
  });
});
