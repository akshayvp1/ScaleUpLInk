import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { toast } from "react-hot-toast";

import CallProvider from "../../src/components/call/CallProvider";
import { useCall } from "../../src/context/call/callContext";
import type { IncomingCall } from "../../src/types/call/call.types";

class FakeTrack {
  kind: "audio" | "video";
  id: string;
  readyState: "live" | "ended" = "live";
  enabled = true;

  constructor(kind: "audio" | "video", id: string) {
    this.kind = kind;
    this.id = id;
  }

  stop = vi.fn(() => {
    this.readyState = "ended";
  });
}

class FakeMediaStream {
  private tracks: FakeTrack[];

  constructor(tracks: FakeTrack[] = []) {
    this.tracks = [...tracks];
  }

  getTracks() {
    return [...this.tracks];
  }

  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === "audio");
  }

  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === "video");
  }

  addTrack(track: FakeTrack) {
    this.tracks.push(track);
  }

  removeTrack(track: FakeTrack) {
    this.tracks = this.tracks.filter((entry) => entry !== track);
  }
}

class FakeSender {
  track: FakeTrack | null;
  replaceTrack = vi.fn(async (track: FakeTrack) => {
    this.track = track;
  });

  constructor(track: FakeTrack | null) {
    this.track = track;
  }
}

class FakeTransceiver {
  receiver: { track: { kind: string } };
  sender: FakeSender;
  direction: "sendrecv" | "sendonly" | "recvonly" | "inactive";

  constructor(kind: string, direction: FakeTransceiver["direction"]) {
    this.receiver = { track: { kind } };
    this.sender = new FakeSender(null);
    this.direction = direction;
  }
}

class FakePeerConnection {
  static instances: FakePeerConnection[] = [];

  signalingState = "stable";
  localDescription: { type?: string } | null = null;
  remoteDescription: { type?: string } | null = null;
  onicecandidate: ((event: unknown) => void) | null = null;
  ontrack: ((event: unknown) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  private senders: FakeSender[] = [];
  private transceivers: FakeTransceiver[] = [];

  createOffer = vi.fn(async () => ({ type: "offer", sdp: "offer-sdp" }));
  createAnswer = vi.fn(async () => ({ type: "answer", sdp: "answer-sdp" }));
  setLocalDescription = vi.fn(async (description: { type?: string }) => {
    this.localDescription = description;
    this.signalingState =
      description.type === "answer" ? "stable" : "have-local-offer";
  });
  setRemoteDescription = vi.fn(async (description: { type?: string }) => {
    this.remoteDescription = description;
    this.signalingState =
      description.type === "offer" ? "have-remote-offer" : "stable";
  });
  close = vi.fn();

  constructor() {
    FakePeerConnection.instances.push(this);
  }

  addTrack(track: FakeTrack) {
    const sender = new FakeSender(track);
    this.senders.push(sender);
    return sender;
  }

  getSenders() {
    return this.senders;
  }

  getTransceivers() {
    return this.transceivers;
  }

  addTransceiver(kind: string, init?: { direction: FakeTransceiver["direction"] }) {
    const transceiver = new FakeTransceiver(kind, init?.direction ?? "sendrecv");
    this.transceivers.push(transceiver);
    return transceiver;
  }

  restartIce = vi.fn();
}

class FakeSessionDescription {
  type?: string;
  sdp?: string;

  constructor(description: { type?: string; sdp?: string }) {
    this.type = description.type;
    this.sdp = description.sdp;
  }
}

function Harness() {
  const { activeCall, incomingCall, isCameraOff, acceptCall, toggleCamera } =
    useCall();

  return (
    <div>
      <span data-testid="incoming">{incomingCall?.callId ?? "none"}</span>
      <span data-testid="active">{activeCall?.callId ?? "none"}</span>
      <span data-testid="camera-off">{isCameraOff ? "true" : "false"}</span>
      <button type="button" onClick={() => void acceptCall()}>
        accept-call
      </button>
      <button type="button" onClick={toggleCamera}>
        toggle-camera
      </button>
    </div>
  );
}

const getUserMedia = vi.fn();

const audioTrack = new FakeTrack("audio", "audio-1");
const videoTrack = new FakeTrack("video", "video-1");

function makeIncoming(): IncomingCall {
  return {
    callId: "call-camera",
    callType: "video",
    isGroup: false,
    callerId: "user-other",
    callerName: "Other",
  };
}

async function deliver(event: string, payload: unknown) {
  await act(async () => {
    (h.handlers.get(event) ?? []).forEach((handler) => handler(payload));
  });
}

describe("video call camera renegotiation", () => {
  beforeEach(() => {
    h.handlers.clear();
    h.socket.emit.mockClear();
    h.socket.on.mockClear();
    h.socket.off.mockClear();
    getUserMedia.mockReset();
    FakePeerConnection.instances = [];
    toast.error = vi.fn();

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    vi.stubGlobal("MediaStream", FakeMediaStream);
    vi.stubGlobal("RTCPeerConnection", FakePeerConnection);
    vi.stubGlobal("RTCSessionDescription", FakeSessionDescription);
  });

  it("acquires a camera track, updates the sender, and renegotiates", async () => {
    getUserMedia.mockImplementation(
      async (constraints: { video?: boolean | object }) => {
        if (!constraints.video) {
          return new FakeMediaStream([audioTrack]);
        }

        if (constraints.video === true || typeof constraints.video === "object") {
          if (getUserMedia.mock.calls.length === 1) {
            const error = new Error("No camera");
            error.name = "NotFoundError";
            throw error;
          }

          return new FakeMediaStream([videoTrack]);
        }

        return new FakeMediaStream([audioTrack]);
      }
    );

    render(
      <CallProvider>
        <Harness />
      </CallProvider>
    );

    await deliver("call_incoming", makeIncoming());
    await userEvent.click(screen.getByRole("button", { name: "accept-call" }));

    await waitFor(() => {
      expect(screen.getByTestId("active")).toHaveTextContent("call-camera");
    });

    await deliver("call_joined", {
      callId: "call-camera",
      callType: "video",
      isGroup: false,
      participants: [{ userId: "user-other", name: "Other" }],
    });

    await deliver("webrtc_offer", {
      callId: "call-camera",
      fromUserId: "user-other",
      sdp: { type: "offer", sdp: "offer-sdp" },
    });

    await waitFor(() => {
      expect(h.socket.emit).toHaveBeenCalledWith(
        "webrtc_answer",
        expect.objectContaining({ targetUserId: "user-other" })
      );
    });

    expect(screen.getByTestId("camera-off")).toHaveTextContent("true");

    const peer = FakePeerConnection.instances[0];
    const videoTransceiver = peer
      .getTransceivers()
      .find((transceiver) => transceiver.receiver.track.kind === "video");

    expect(videoTransceiver?.direction).toBe("recvonly");

    await userEvent.click(screen.getByRole("button", { name: "toggle-camera" }));

    await waitFor(() => {
      expect(screen.getByTestId("camera-off")).toHaveTextContent("false");
    });

    expect(getUserMedia).toHaveBeenLastCalledWith({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });
    expect(videoTransceiver?.sender.replaceTrack).toHaveBeenCalledWith(
      videoTrack
    );
    expect(videoTransceiver?.direction).toBe("sendrecv");

    await waitFor(() => {
      expect(h.socket.emit).toHaveBeenCalledWith(
        "webrtc_offer",
        expect.objectContaining({ targetUserId: "user-other" })
      );
    });

    expect(h.socket.emit).toHaveBeenCalledWith(
      "call_peer_state",
      expect.objectContaining({ cameraOff: false })
    );
  });

  it("keeps the camera off and reports an error when acquisition fails", async () => {
    getUserMedia.mockImplementation(
      async (constraints: { video?: boolean | object }) => {
        if (!constraints.video) {
          return new FakeMediaStream([audioTrack]);
        }

        if (getUserMedia.mock.calls.length === 1) {
          const error = new Error("No camera");
          error.name = "NotFoundError";
          throw error;
        }

        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        throw error;
      }
    );

    render(
      <CallProvider>
        <Harness />
      </CallProvider>
    );

    await deliver("call_incoming", makeIncoming());
    await userEvent.click(screen.getByRole("button", { name: "accept-call" }));

    await waitFor(() => {
      expect(screen.getByTestId("active")).toHaveTextContent("call-camera");
    });

    await deliver("call_joined", {
      callId: "call-camera",
      callType: "video",
      isGroup: false,
      participants: [{ userId: "user-other", name: "Other" }],
    });

    await userEvent.click(screen.getByRole("button", { name: "toggle-camera" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(screen.getByTestId("camera-off")).toHaveTextContent("true");
    expect(h.socket.emit).not.toHaveBeenCalledWith(
      "webrtc_offer",
      expect.anything()
    );
  });
});
