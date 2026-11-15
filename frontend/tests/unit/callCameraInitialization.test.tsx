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

import CallProvider from "../../src/components/call/CallProvider";
import { useCall } from "../../src/context/call/callContext";
import type { IncomingCall } from "../../src/types/call/call.types";

class FakeTrack {
  kind: "audio" | "video";
  id: string;
  readyState: "live" | "ended" = "live";
  enabled = true;
  onended: (() => void) | null = null;

  constructor(kind: "audio" | "video", id: string) {
    this.kind = kind;
    this.id = id;
  }

  stop = vi.fn(() => {
    this.readyState = "ended";
  });

  end() {
    this.readyState = "ended";
    this.onended?.();
  }
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

  addTransceiver(
    kind: string,
    init?: { direction: FakeTransceiver["direction"] }
  ) {
    const transceiver = new FakeTransceiver(
      kind,
      init?.direction ?? "sendrecv"
    );
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
  const { activeCall, incomingCall, isCameraOff, localStream, acceptCall } =
    useCall();
  const hasEnabledVideo = Boolean(
    localStream
      ?.getVideoTracks()
      .some((track) => track.readyState === "live" && track.enabled)
  );

  return (
    <div>
      <span data-testid="incoming">{incomingCall?.callId ?? "none"}</span>
      <span data-testid="active">{activeCall?.callId ?? "none"}</span>
      <span data-testid="camera-off">{isCameraOff ? "true" : "false"}</span>
      <span data-testid="has-video">{hasEnabledVideo ? "yes" : "no"}</span>
      <button type="button" onClick={() => void acceptCall()}>
        accept-call
      </button>
    </div>
  );
}

const getUserMedia = vi.fn();

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

function mediaError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

async function acceptVideoCall() {
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
}

function activePeer() {
  return FakePeerConnection.instances[0];
}

describe("video call camera initialization", () => {
  beforeEach(() => {
    h.handlers.clear();
    h.socket.emit.mockClear();
    h.socket.on.mockClear();
    h.socket.off.mockClear();
    getUserMedia.mockReset();
    FakePeerConnection.instances = [];

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    vi.stubGlobal("MediaStream", FakeMediaStream);
    vi.stubGlobal("RTCPeerConnection", FakePeerConnection);
    vi.stubGlobal("RTCSessionDescription", FakeSessionDescription);
  });

  it("keeps the receiver camera enabled and sends video in the answer", async () => {
    const audioTrack = new FakeTrack("audio", "audio-1");
    const videoTrack = new FakeTrack("video", "video-1");

    getUserMedia.mockResolvedValue(
      new FakeMediaStream([audioTrack, videoTrack])
    );

    await acceptVideoCall();

    expect(screen.getByTestId("camera-off")).toHaveTextContent("false");
    expect(screen.getByTestId("has-video")).toHaveTextContent("yes");
    expect(videoTrack.enabled).toBe(true);

    await deliver("call_joined", {
      callId: "call-camera",
      callType: "video",
      isGroup: false,
      participants: [{ userId: "user-other", name: "Other" }],
    });

    // Joining must not announce that the receiver's camera is off.
    expect(h.socket.emit).not.toHaveBeenCalledWith(
      "call_peer_state",
      expect.objectContaining({ cameraOff: true })
    );

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

    const peer = activePeer();
    expect(
      peer.getSenders().some((sender) => sender.track?.kind === "video")
    ).toBe(true);
    expect(
      peer
        .getTransceivers()
        .some((transceiver) => transceiver.receiver.track.kind === "video")
    ).toBe(false);
    expect(screen.getByTestId("camera-off")).toHaveTextContent("false");
    expect(videoTrack.enabled).toBe(true);
  });

  it("retries a busy camera with relaxed constraints instead of disabling it", async () => {
    const audioTrack = new FakeTrack("audio", "audio-1");
    const videoTrack = new FakeTrack("video", "video-1");

    getUserMedia.mockImplementation(
      async (constraints: { video?: boolean | object }) => {
        if (!constraints.video) {
          return new FakeMediaStream([audioTrack]);
        }

        if (getUserMedia.mock.calls.length === 1) {
          throw mediaError("NotReadableError");
        }

        return new FakeMediaStream([audioTrack, videoTrack]);
      }
    );

    await acceptVideoCall();

    expect(getUserMedia).toHaveBeenNthCalledWith(1, {
      audio: { echoCancellation: true, noiseSuppression: true },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });
    expect(getUserMedia).toHaveBeenNthCalledWith(2, {
      audio: { echoCancellation: true, noiseSuppression: true },
      video: true,
    });

    expect(screen.getByTestId("camera-off")).toHaveTextContent("false");
    expect(screen.getByTestId("has-video")).toHaveTextContent("yes");
  });

  it("recovers the video track if the camera ends during the call", async () => {
    const audioTrack = new FakeTrack("audio", "audio-1");
    const firstVideoTrack = new FakeTrack("video", "video-1");
    const replacementTrack = new FakeTrack("video", "video-2");

    getUserMedia.mockResolvedValue(
      new FakeMediaStream([audioTrack, firstVideoTrack])
    );

    await acceptVideoCall();

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

    getUserMedia.mockResolvedValue(new FakeMediaStream([replacementTrack]));

    await act(async () => {
      firstVideoTrack.end();
    });

    await waitFor(() => {
      expect(screen.getByTestId("camera-off")).toHaveTextContent("false");
      expect(screen.getByTestId("has-video")).toHaveTextContent("yes");
    });

    const peer = activePeer();
    await waitFor(() => {
      expect(
        peer
          .getSenders()
          .some((sender) => sender.track === replacementTrack)
      ).toBe(true);
    });

    expect(h.socket.emit).toHaveBeenCalledWith(
      "webrtc_offer",
      expect.objectContaining({ targetUserId: "user-other" })
    );
  });
});
