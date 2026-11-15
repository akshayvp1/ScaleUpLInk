import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";

import { useAppSelector } from "../../redux/hooks";
import { socket } from "../../socket/socket";
import { CallContext } from "../../context/call/callContext";
import {
  primeRingtoneAudio,
  startRingtone,
  stopRingtone,
} from "../../services/call/ringtone";
import type {
  CallParticipant,
  CallSession,
  CallType,
  IncomingCall,
  StartCallInput,
} from "../../types/call/call.types";
import IncomingCallModal from "./IncomingCallModal";
import CallOverlay from "./CallOverlay";

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
    ],
  },
  {
    urls: "stun:global.stun.twilio.com:3478",
  },
];

interface CallCreatedPayload {
  callId: string;
  callType: CallType;
  isGroup: boolean;
  groupId?: string;
  groupName?: string;
  participants: Array<{ userId: string; name: string }>;
}

type CallJoinedPayload = CallCreatedPayload;

interface CallPeerJoinedPayload {
  callId: string;
  userId: string;
  name: string;
}

interface CallRejectedPayload {
  callId: string;
  userId: string;
  name: string;
}

interface CallPeerLeftPayload {
  callId: string;
  userId: string;
}

interface CallEndedPayload {
  callId: string;
  endedBy: string;
}

interface CallErrorPayload {
  callId?: string;
  message?: string;
}

interface CallPeerStatePayload {
  callId: string;
  userId: string;
  muted: boolean;
  cameraOff: boolean;
}

type MediaFailureReason =
  | "permission_denied"
  | "device_unavailable"
  | "device_busy"
  | "unsupported"
  | "unknown";

interface CallFailedPayload {
  callId: string;
  callType: CallType;
  userId: string;
  name: string;
  reason?: MediaFailureReason | string;
}

interface LocalMediaResult {
  stream: MediaStream;
  cameraUnavailable: boolean;
}

interface WebRtcOfferPayload {
  callId: string;
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRtcAnswerPayload {
  callId: string;
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRtcIcePayload {
  callId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

function getUserIdFromToken(token?: string | null): string {
  if (!token) return "";

  try {
    const payloadPart = token.split(".")[1] ?? "";
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as {
      id?: string;
      _id?: string;
    };
    return payload.id || payload._id || "";
  } catch {
    return "";
  }
}

function getErrorName(error: unknown): string {
  if (error && typeof error === "object" && "name" in error) {
    return String((error as { name?: unknown }).name ?? "");
  }

  return "";
}

function getMediaFailureReason(error: unknown): MediaFailureReason {
  const name = getErrorName(error);

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "permission_denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "device_unavailable";
    case "NotReadableError":
    case "TrackStartError":
      return "device_busy";
    case "NotSupportedError":
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "unsupported";
    default:
      return "unknown";
  }
}

function getMediaDeviceLabel(callType: CallType): string {
  return callType === "video" ? "microphone and camera" : "microphone";
}

function getMediaErrorMessage(error: unknown, callType: CallType): string {
  const reason = getMediaFailureReason(error);
  const device = getMediaDeviceLabel(callType);

  switch (reason) {
    case "permission_denied":
      return `${device.charAt(0).toUpperCase()}${device.slice(
        1
      )} permission was denied. Allow access in your browser settings and try again.`;
    case "device_unavailable":
      return `No ${device} was found on this device.`;
    case "device_busy":
      return `Your ${device} is being used by another application. Close it and try again.`;
    case "unsupported":
      return "Audio and video calls are not supported in this browser.";
    default:
      return `Unable to access your ${device}. Check your device and browser permissions.`;
  }
}

function getPeerMediaFailureMessage(payload: CallFailedPayload): string {
  const name = payload.name || "The other person";
  const device =
    payload.callType === "video" ? "microphone or camera" : "microphone";

  switch (payload.reason) {
    case "permission_denied":
      return `${name} did not allow ${device} access, so the call could not start.`;
    case "device_unavailable":
      return `${name} has no available ${device}, so the call could not start.`;
    case "device_busy":
      return `${name}'s ${device} is being used by another application.`;
    case "unsupported":
      return `${name}'s browser does not support audio and video calls.`;
    default:
      return `${name} could not access their ${device}, so the call could not start.`;
  }
}

function createCallId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `call_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function CallProvider({ children }: { children: ReactNode }) {
  const authUser = useAppSelector((state) => state.auth.user);
  const authToken =
    useAppSelector((state) => state.auth.token) || authUser?.token || "";
  const currentUserId =
    authUser?._id ||
    authUser?.id ||
    getUserIdFromToken(authToken) ||
    getUserIdFromToken(authUser?.token) ||
    "";
  const currentUserName = authUser?.name || "You";

  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const activeCallRef = useRef<CallSession | null>(null);
  const incomingCallRef = useRef<IncomingCall | null>(null);
  const callIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const ringTimeoutRef = useRef<number | null>(null);
  const incomingTimeoutRef = useRef<number | null>(null);
  const currentUserIdRef = useRef("");
  const currentUserNameRef = useRef("");
  const isMutedRef = useRef(false);
  const isCameraOffRef = useRef(false);
  const cameraRequestRef = useRef(false);
  const makingOfferRef = useRef<Set<string>>(new Set());
  const ignoreOfferRef = useRef<Map<string, boolean>>(new Map());
  const pendingRenegotiationRef = useRef<Set<string>>(new Set());

  currentUserIdRef.current = currentUserId;
  currentUserNameRef.current = currentUserName;

  const commitCall = useCallback((call: CallSession | null) => {
    activeCallRef.current = call;
    setActiveCall(call);
  }, []);

  const commitIncomingCall = useCallback((call: IncomingCall | null) => {
    if (incomingTimeoutRef.current !== null) {
      window.clearTimeout(incomingTimeoutRef.current);
      incomingTimeoutRef.current = null;
    }

    if (!call) {
      stopRingtone();
    }

    incomingCallRef.current = call;
    setIncomingCall(call);
  }, []);

  const updateActiveCall = useCallback(
    (updater: (call: CallSession) => CallSession) => {
      setActiveCall((previous) => {
        if (!previous) return previous;

        const next = updater(previous);
        activeCallRef.current = next;
        return next;
      });
    },
    []
  );

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    isMutedRef.current = false;
    isCameraOffRef.current = false;
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current !== null) {
      window.clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  const closePeer = useCallback((peerId: string) => {
    const peer = peersRef.current.get(peerId);

    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peersRef.current.delete(peerId);
    }

    pendingIceRef.current.delete(peerId);
    makingOfferRef.current.delete(peerId);
    ignoreOfferRef.current.delete(peerId);
    pendingRenegotiationRef.current.delete(peerId);
    setRemoteStreams((previous) => {
      if (!(peerId in previous)) return previous;

      const next = { ...previous };
      delete next[peerId];
      return next;
    });
  }, []);

  const cleanupCall = useCallback(() => {
    stopRingtone();
    clearRingTimeout();
    [...peersRef.current.keys()].forEach((peerId) => closePeer(peerId));
    peersRef.current.clear();
    pendingIceRef.current.clear();
    makingOfferRef.current.clear();
    ignoreOfferRef.current.clear();
    pendingRenegotiationRef.current.clear();
    cameraRequestRef.current = false;
    stopLocalStream();
    callIdRef.current = null;
    commitCall(null);
    commitIncomingCall(null);
    setRemoteStreams({});
    setIsSpeakerMuted(false);
  }, [
    clearRingTimeout,
    closePeer,
    commitCall,
    commitIncomingCall,
    stopLocalStream,
  ]);

  const acquireLocalStream = useCallback(
    async (callType: CallType): Promise<LocalMediaResult> => {
      if (!navigator.mediaDevices?.getUserMedia) {
        const error = new Error(
          "Audio and video calls are not supported in this browser."
        );
        error.name = "NotSupportedError";
        throw error;
      }

      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
      };

      let stream: MediaStream;

      if (callType === "video") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });
        } catch {
          // The camera may be missing, busy, or the user may have denied
          // camera access. Fall back to the microphone so the call can still
          // continue as an audio call instead of failing outright.
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false,
          });
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: false,
        });
      }

      if (stream.getAudioTracks().length === 0) {
        stream.getTracks().forEach((track) => track.stop());
        const error = new Error("No microphone was found on this device.");
        error.name = "NotFoundError";
        throw error;
      }

      const hasVideo = stream.getVideoTracks().length > 0;
      const cameraUnavailable = callType === "video" && !hasVideo;

      localStreamRef.current = stream;
      setLocalStream(stream);
      isMutedRef.current = false;
      isCameraOffRef.current = !hasVideo;
      setIsMuted(false);
      setIsCameraOff(!hasVideo);

      return { stream, cameraUnavailable };
    },
    []
  );

  const acquireVideoTrack = useCallback(async (): Promise<MediaStreamTrack> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const error = new Error(
        "Audio and video calls are not supported in this browser."
      );
      error.name = "NotSupportedError";
      throw error;
    }

    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    const track = cameraStream.getVideoTracks()[0];

    if (!track) {
      cameraStream.getTracks().forEach((streamTrack) => streamTrack.stop());
      const error = new Error("No camera was found on this device.");
      error.name = "NotFoundError";
      throw error;
    }

    return track;
  }, []);

  const mergeParticipants = useCallback(
    (incoming: Array<{ userId: string; name: string }>): CallParticipant[] => {
      const selfId = currentUserIdRef.current;
      const participants = new Map<string, CallParticipant>();

      if (selfId) {
        participants.set(selfId, {
          userId: selfId,
          name: currentUserNameRef.current,
          isLocal: true,
        });
      }

      incoming.forEach((participant) => {
        if (!participant.userId || participant.userId === selfId) return;

        const existing = activeCallRef.current?.participants.find(
          (item) => item.userId === participant.userId
        );

        participants.set(participant.userId, {
          userId: participant.userId,
          name:
            participant.name ||
            existing?.name ||
            "Participant",
          muted: existing?.muted,
          cameraOff: existing?.cameraOff,
          isLocal: false,
        });
      });

      return [...participants.values()];
    },
    []
  );

  const createPeerConnection = useCallback((peerId: string) => {
    const existing = peersRef.current.get(peerId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const stream = localStreamRef.current;
    const callType = activeCallRef.current?.callType;

    stream?.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    if (
      callType === "video" &&
      !stream?.getVideoTracks().some((track) => track.readyState === "live")
    ) {
      try {
        peer.addTransceiver("video", { direction: "recvonly" });
      } catch {
        // Some browsers do not allow adding transceivers before negotiation.
      }
    }

    peer.onicecandidate = (event) => {
      const callId = callIdRef.current;
      if (!event.candidate || !callId) return;

      socket.emit("webrtc_ice_candidate", {
        callId,
        targetUserId: peerId,
        candidate: event.candidate.toJSON(),
      });
    };

    peer.ontrack = (event) => {
      const incomingStream = event.streams[0];

      setRemoteStreams((previous) => {
        const nextStream =
          previous[peerId] ?? incomingStream ?? new MediaStream();

        if (
          !nextStream
            .getTracks()
            .some((track) => track.id === event.track.id)
        ) {
          nextStream.addTrack(event.track);
        }

        return {
          ...previous,
          [peerId]: nextStream,
        };
      });
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") {
        try {
          peer.restartIce();
        } catch {
          // The call can continue with a fresh offer if needed.
        }
      }
    };

    peersRef.current.set(peerId, peer);
    return peer;
  }, []);

  const flushPendingIce = useCallback(
    async (peerId: string, peer: RTCPeerConnection) => {
      const pending = pendingIceRef.current.get(peerId);
      if (!pending?.length) return;

      pendingIceRef.current.delete(peerId);

      for (const candidate of pending) {
        try {
          await peer.addIceCandidate(candidate);
        } catch {
          // Ignore stale candidates from a previous negotiation.
        }
      }
    },
    []
  );

  const attachLocalVideoTrack = useCallback(
    (
      peer: RTCPeerConnection,
      track: MediaStreamTrack,
      stream: MediaStream
    ) => {
      if (peer.getSenders().some((sender) => sender.track === track)) {
        return;
      }

      const videoSender = peer
        .getSenders()
        .find((sender) => sender.track?.kind === "video");

      if (videoSender) {
        void videoSender.replaceTrack(track).catch(() => {});
        return;
      }

      const transceiver = peer
        .getTransceivers()
        .find(
          (item) =>
            item.receiver.track.kind === "video" &&
            item.sender.track === null
        );

      if (transceiver) {
        void transceiver.sender.replaceTrack(track).catch(() => {});
        try {
          transceiver.direction = "sendrecv";
        } catch {
          // Direction changes can fail on already-stopped transceivers.
        }
        return;
      }

      peer.addTrack(track, stream);
    },
    []
  );

  const makeOffer = useCallback(
    async (peerId: string) => {
      const callId = callIdRef.current;
      if (!callId || !peerId || peerId === currentUserIdRef.current) return;

      const peer = createPeerConnection(peerId);

      if (makingOfferRef.current.has(peerId)) {
        pendingRenegotiationRef.current.add(peerId);
        return;
      }

      if (peer.signalingState !== "stable") {
        pendingRenegotiationRef.current.add(peerId);
        return;
      }

      makingOfferRef.current.add(peerId);

      try {
        const offer = await peer.createOffer();

        if (peer.signalingState !== "stable") {
          pendingRenegotiationRef.current.add(peerId);
          return;
        }

        await peer.setLocalDescription(offer);

        socket.emit("webrtc_offer", {
          callId,
          targetUserId: peerId,
          sdp: offer,
        });
      } catch (error) {
        if (peer.signalingState !== "stable") {
          pendingRenegotiationRef.current.add(peerId);
        }

        console.error("Failed to create WebRTC offer:", error);
      } finally {
        makingOfferRef.current.delete(peerId);

        if (
          pendingRenegotiationRef.current.has(peerId) &&
          peer.signalingState === "stable"
        ) {
          pendingRenegotiationRef.current.delete(peerId);
          void makeOffer(peerId);
        }
      }
    },
    [createPeerConnection]
  );

  const handleOffer = useCallback(
    async (payload: WebRtcOfferPayload) => {
      if (payload.callId !== callIdRef.current) return;

      const peerId = payload.fromUserId;
      const peer = createPeerConnection(peerId);
      const polite = currentUserIdRef.current < peerId;
      const offerCollision =
        makingOfferRef.current.has(peerId) ||
        peer.signalingState !== "stable";

      const ignoreOffer = !polite && offerCollision;
      ignoreOfferRef.current.set(peerId, ignoreOffer);

      if (ignoreOffer) return;

      try {
        if (offerCollision) {
          pendingRenegotiationRef.current.add(peerId);

          if (peer.signalingState !== "stable") {
            await peer.setLocalDescription({ type: "rollback" });
          }
        }

        await peer.setRemoteDescription(
          new RTCSessionDescription(payload.sdp)
        );
        ignoreOfferRef.current.delete(peerId);
        await flushPendingIce(peerId, peer);

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          callId: payload.callId,
          targetUserId: peerId,
          sdp: answer,
        });

        if (pendingRenegotiationRef.current.has(peerId)) {
          pendingRenegotiationRef.current.delete(peerId);
          void makeOffer(peerId);
        }
      } catch (error) {
        console.error("Failed to handle WebRTC offer:", error);
      }
    },
    [createPeerConnection, flushPendingIce, makeOffer]
  );

  const handleAnswer = useCallback(
    async (payload: WebRtcAnswerPayload) => {
      if (payload.callId !== callIdRef.current) return;

      try {
        const peer = peersRef.current.get(payload.fromUserId);
        if (!peer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(payload.sdp)
        );
        ignoreOfferRef.current.delete(payload.fromUserId);
        await flushPendingIce(payload.fromUserId, peer);

        if (pendingRenegotiationRef.current.has(payload.fromUserId)) {
          pendingRenegotiationRef.current.delete(payload.fromUserId);
          void makeOffer(payload.fromUserId);
        }
      } catch (error) {
        console.error("Failed to handle WebRTC answer:", error);
      }
    },
    [flushPendingIce, makeOffer]
  );

  const handleIceCandidate = useCallback(
    async (payload: WebRtcIcePayload) => {
      if (payload.callId !== callIdRef.current) return;
      if (ignoreOfferRef.current.get(payload.fromUserId)) return;

      const peer = peersRef.current.get(payload.fromUserId);

      if (peer?.remoteDescription) {
        try {
          await peer.addIceCandidate(payload.candidate);
        } catch (error) {
          console.error("Failed to add ICE candidate:", error);
        }
        return;
      }

      const pending =
        pendingIceRef.current.get(payload.fromUserId) ?? [];
      pending.push(payload.candidate);
      pendingIceRef.current.set(payload.fromUserId, pending);
    },
    []
  );

  const broadcastPeerState = useCallback(() => {
    const callId = callIdRef.current;
    if (!callId) return;

    socket.emit("call_peer_state", {
      callId,
      muted: isMutedRef.current,
      cameraOff: isCameraOffRef.current,
    });
  }, []);

  const startCall = useCallback(
    async (input: StartCallInput) => {
      if (!currentUserIdRef.current) {
        toast.error("Please sign in again to start a call.");
        return;
      }

      if (activeCallRef.current) {
        toast.error("You are already in a call.");
        return;
      }

      if (incomingCallRef.current) {
        toast.error("Answer or decline the incoming call first.");
        return;
      }

      if (!input.groupId && !input.targetUserId) {
        toast.error("Choose someone to call.");
        return;
      }

      if (!socket.connected) {
        toast.error("Still connecting. Please try again in a moment.");
        return;
      }

      try {
        const media = await acquireLocalStream(input.callType);

        if (media.cameraUnavailable) {
          toast(
            "Camera is unavailable. Continuing with audio only."
          );
        }
      } catch (error) {
        toast.error(getMediaErrorMessage(error, input.callType));
        stopLocalStream();
        return;
      }

      const callId = createCallId();
      const selfId = currentUserIdRef.current;
      const session: CallSession = {
        callId,
        callType: input.callType,
        isGroup: Boolean(input.groupId),
        groupId: input.groupId,
        groupName: input.groupName,
        direction: "outgoing",
        status: "ringing",
        participants: [
          {
            userId: selfId,
            name: currentUserNameRef.current,
            isLocal: true,
          },
        ],
      };

      callIdRef.current = callId;
      commitCall(session);

      socket.emit("call_start", {
        callId,
        callType: input.callType,
        targetUserId: input.groupId ? undefined : input.targetUserId,
        groupId: input.groupId,
      });

      clearRingTimeout();
      ringTimeoutRef.current = window.setTimeout(() => {
        const call = activeCallRef.current;

        if (!call || call.startedAt || call.participants.length > 1) return;

        toast.error(
          call.isGroup ? "No one answered the group call." : "No answer."
        );
        socket.emit(call.isGroup ? "call_leave" : "call_end", {
          callId: call.callId,
        });
        cleanupCall();
      }, 45_000);
    },
    [
      acquireLocalStream,
      cleanupCall,
      clearRingTimeout,
      commitCall,
      stopLocalStream,
    ]
  );

  const rejectCall = useCallback(() => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;

    socket.emit("call_reject", { callId: incoming.callId });
    commitIncomingCall(null);
  }, [commitIncomingCall]);

  const acceptCall = useCallback(async () => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;

    if (activeCallRef.current) {
      toast.error("You are already in a call.");
      return;
    }

    // Stop the missed-call timer while the user is granting permissions.
    stopRingtone();

    if (incomingTimeoutRef.current !== null) {
      window.clearTimeout(incomingTimeoutRef.current);
      incomingTimeoutRef.current = null;
    }

    try {
      const media = await acquireLocalStream(incoming.callType);

      if (incomingCallRef.current?.callId !== incoming.callId) {
        stopLocalStream();
        return;
      }

      if (media.cameraUnavailable) {
        toast(
          "Camera is unavailable. You joined with audio only."
        );
      }
    } catch (error) {
      if (incomingCallRef.current?.callId !== incoming.callId) {
        stopLocalStream();
        return;
      }

      // A device/permission failure is not a rejection. Tell the caller what
      // actually happened so they do not see "declined by the other person".
      socket.emit("call_media_failed", {
        callId: incoming.callId,
        reason: getMediaFailureReason(error),
      });
      commitIncomingCall(null);
      toast.error(getMediaErrorMessage(error, incoming.callType));
      stopLocalStream();
      return;
    }

    const selfId = currentUserIdRef.current;
    const session: CallSession = {
      callId: incoming.callId,
      callType: incoming.callType,
      isGroup: incoming.isGroup,
      groupId: incoming.groupId,
      groupName: incoming.groupName,
      direction: "incoming",
      status: "connecting",
      participants: [
        {
          userId: selfId,
          name: currentUserNameRef.current,
          isLocal: true,
        },
      ],
    };

    callIdRef.current = incoming.callId;
    commitCall(session);
    commitIncomingCall(null);
    socket.emit("call_accept", { callId: incoming.callId });
  }, [
    acquireLocalStream,
    commitCall,
    commitIncomingCall,
    stopLocalStream,
  ]);

  const endCall = useCallback(() => {
    const call = activeCallRef.current;

    if (!call) {
      rejectCall();
      return;
    }

    socket.emit(call.isGroup ? "call_leave" : "call_end", {
      callId: call.callId,
    });
    cleanupCall();
  }, [cleanupCall, rejectCall]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isMutedRef.current;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);
    broadcastPeerState();
  }, [broadcastPeerState]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    const call = activeCallRef.current;
    if (!stream || call?.callType !== "video") return;

    const liveVideoTracks = stream
      .getVideoTracks()
      .filter((track) => track.readyState === "live");

    if (liveVideoTracks.length > 0) {
      const nextCameraOff = !isCameraOffRef.current;

      liveVideoTracks.forEach((track) => {
        track.enabled = !nextCameraOff;
      });

      isCameraOffRef.current = nextCameraOff;
      setIsCameraOff(nextCameraOff);
      broadcastPeerState();
      return;
    }

    if (cameraRequestRef.current) return;

    const callId = callIdRef.current;
    cameraRequestRef.current = true;

    void (async () => {
      try {
        const videoTrack = await acquireVideoTrack();

        if (
          callIdRef.current !== callId ||
          activeCallRef.current?.callType !== "video"
        ) {
          videoTrack.stop();
          return;
        }

        const currentStream = localStreamRef.current;
        if (!currentStream) {
          videoTrack.stop();
          return;
        }

        currentStream.getVideoTracks().forEach((track) => {
          if (track.readyState !== "live") {
            currentStream.removeTrack(track);
            track.stop();
          }
        });

        currentStream.addTrack(videoTrack);

        const nextStream = new MediaStream(currentStream.getTracks());
        localStreamRef.current = nextStream;
        setLocalStream(nextStream);
        isCameraOffRef.current = false;
        setIsCameraOff(false);

        peersRef.current.forEach((peer) => {
          attachLocalVideoTrack(peer, videoTrack, nextStream);
        });

        [...peersRef.current.keys()].forEach((peerId) => {
          void makeOffer(peerId);
        });

        broadcastPeerState();
      } catch (error) {
        toast.error(getMediaErrorMessage(error, "video"));
      } finally {
        cameraRequestRef.current = false;
      }
    })();
  }, [
    acquireVideoTrack,
    attachLocalVideoTrack,
    broadcastPeerState,
    makeOffer,
  ]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerMuted((previous) => !previous);
  }, []);

  useEffect(() => {
    if (!authToken) {
      cleanupCall();
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    const previousToken = (socket.auth as { token?: string } | undefined)
      ?.token;
    socket.auth = { token: authToken };

    if (!socket.connected) {
      socket.connect();
    } else if (previousToken && previousToken !== authToken) {
      socket.disconnect();
      socket.connect();
    }
  }, [authToken, cleanupCall]);

  useEffect(() => {
    primeRingtoneAudio();

    return () => {
      stopRingtone();
    };
  }, []);

  useEffect(() => {
    if (!currentUserId || !authToken) return;

    function onCallCreated(payload: CallCreatedPayload) {
      if (payload.callId !== callIdRef.current) return;

      updateActiveCall((call) => ({
        ...call,
        groupName: payload.groupName ?? call.groupName,
        status: call.status === "active" ? "active" : "ringing",
        participants: mergeParticipants(payload.participants),
      }));
    }

    function onCallIncoming(payload: IncomingCall) {
      const currentIncoming = incomingCallRef.current;
      const currentActive = activeCallRef.current;

      // Duplicate delivery of the same invite (e.g. a reconnect) must not be
      // treated as "busy" and auto-rejected.
      if (
        currentIncoming?.callId === payload.callId ||
        currentActive?.callId === payload.callId
      ) {
        return;
      }

      if (currentActive || currentIncoming) {
        socket.emit("call_reject", { callId: payload.callId });
        return;
      }

      commitIncomingCall(payload);
      startRingtone();

      incomingTimeoutRef.current = window.setTimeout(() => {
        const pending = incomingCallRef.current;

        if (!pending || pending.callId !== payload.callId) return;

        socket.emit("call_reject", { callId: payload.callId });
        commitIncomingCall(null);
      }, 60_000);
    }

    function onCallJoined(payload: CallJoinedPayload) {
      clearRingTimeout();

      const session: CallSession = {
        callId: payload.callId,
        callType: payload.callType,
        isGroup: payload.isGroup,
        groupId: payload.groupId,
        groupName: payload.groupName,
        direction: "incoming",
        status: "active",
        participants: mergeParticipants(payload.participants),
        startedAt: Date.now(),
      };

      callIdRef.current = payload.callId;
      commitCall(session);
      commitIncomingCall(null);

      // The participant(s) who were already in the call create the WebRTC
      // offers when they receive call_peer_joined. The newly joined side only
      // answers, which avoids offer glare.
      broadcastPeerState();
    }

    function onCallPeerJoined(payload: CallPeerJoinedPayload) {
      if (payload.callId !== callIdRef.current) return;

      clearRingTimeout();

      updateActiveCall((call) => {
        const exists = call.participants.some(
          (participant) => participant.userId === payload.userId
        );

        return {
          ...call,
          status: "active",
          startedAt: call.startedAt ?? Date.now(),
          participants: exists
            ? call.participants.map((participant) =>
                participant.userId === payload.userId
                  ? {
                      ...participant,
                      name: payload.name || participant.name,
                    }
                  : participant
              )
            : [
                ...call.participants,
                {
                  userId: payload.userId,
                  name: payload.name || "Participant",
                  isLocal: false,
                },
              ],
        };
      });

      // Existing participants initiate the offer to the peer that just
      // joined, giving the call a deterministic negotiation direction.
      void makeOffer(payload.userId);
      broadcastPeerState();
    }

    function onCallRejected(payload: CallRejectedPayload) {
      if (payload.callId !== callIdRef.current) return;

      const call = activeCallRef.current;

      if (call?.isGroup) {
        toast.error(`${payload.name || "A participant"} declined the call.`);
        return;
      }

      toast.error(`${payload.name || "The person"} declined the call.`);
      cleanupCall();
    }

    function onCallFailed(payload: CallFailedPayload) {
      const isCurrentCall = payload.callId === callIdRef.current;
      const isIncomingCall =
        incomingCallRef.current?.callId === payload.callId;

      if (!isCurrentCall && !isIncomingCall) return;

      toast.error(getPeerMediaFailureMessage(payload));

      if (!isCurrentCall) {
        // For a group call the remaining invitees can still accept.
        return;
      }

      if (activeCallRef.current?.isGroup) return;

      cleanupCall();
    }

    function onCallPeerLeft(payload: CallPeerLeftPayload) {
      if (payload.callId !== callIdRef.current) return;

      closePeer(payload.userId);
      updateActiveCall((call) => ({
        ...call,
        participants: call.participants.filter(
          (participant) => participant.userId !== payload.userId
        ),
      }));
    }

    function onCallEnded(payload: CallEndedPayload) {
      const incoming = incomingCallRef.current;

      if (payload.callId !== callIdRef.current) {
        if (incoming?.callId === payload.callId) {
          commitIncomingCall(null);
          toast("Missed call");
        }
        return;
      }

      toast("Call ended");
      cleanupCall();
    }

    function onCallError(payload: CallErrorPayload) {
      if (payload.callId && payload.callId !== callIdRef.current) return;

      toast.error(payload.message || "Unable to start the call.");
      cleanupCall();
    }

    function onCallUnavailable(payload: CallErrorPayload) {
      if (payload.callId && payload.callId !== callIdRef.current) return;

      toast.error(payload.message || "This person is unavailable.");
      cleanupCall();
    }

    function onCallPeerState(payload: CallPeerStatePayload) {
      if (payload.callId !== callIdRef.current) return;

      updateActiveCall((call) => ({
        ...call,
        participants: call.participants.map((participant) =>
          participant.userId === payload.userId
            ? {
                ...participant,
                muted: payload.muted,
                cameraOff: payload.cameraOff,
              }
            : participant
        ),
      }));
    }

    function onWebRtcOffer(payload: WebRtcOfferPayload) {
      void handleOffer(payload);
    }

    function onWebRtcAnswer(payload: WebRtcAnswerPayload) {
      void handleAnswer(payload);
    }

    function onWebRtcIceCandidate(payload: WebRtcIcePayload) {
      void handleIceCandidate(payload);
    }

    socket.on("call_created", onCallCreated);
    socket.on("call_incoming", onCallIncoming);
    socket.on("call_joined", onCallJoined);
    socket.on("call_peer_joined", onCallPeerJoined);
    socket.on("call_rejected", onCallRejected);
    socket.on("call_failed", onCallFailed);
    socket.on("call_peer_left", onCallPeerLeft);
    socket.on("call_ended", onCallEnded);
    socket.on("call_error", onCallError);
    socket.on("call_unavailable", onCallUnavailable);
    socket.on("call_peer_state", onCallPeerState);
    socket.on("webrtc_offer", onWebRtcOffer);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("webrtc_ice_candidate", onWebRtcIceCandidate);

    return () => {
      socket.off("call_created", onCallCreated);
      socket.off("call_incoming", onCallIncoming);
      socket.off("call_joined", onCallJoined);
      socket.off("call_peer_joined", onCallPeerJoined);
      socket.off("call_rejected", onCallRejected);
      socket.off("call_failed", onCallFailed);
      socket.off("call_peer_left", onCallPeerLeft);
      socket.off("call_ended", onCallEnded);
      socket.off("call_error", onCallError);
      socket.off("call_unavailable", onCallUnavailable);
      socket.off("call_peer_state", onCallPeerState);
      socket.off("webrtc_offer", onWebRtcOffer);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("webrtc_ice_candidate", onWebRtcIceCandidate);
    };
  }, [
    authToken,
    broadcastPeerState,
    cleanupCall,
    clearRingTimeout,
    closePeer,
    commitCall,
    commitIncomingCall,
    currentUserId,
    handleAnswer,
    handleIceCandidate,
    handleOffer,
    makeOffer,
    mergeParticipants,
    updateActiveCall,
  ]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        localStream,
        remoteStreams,
        isMuted,
        isCameraOff,
        isSpeakerMuted,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleSpeaker,
      }}
    >
      {children}
      <IncomingCallModal />
      <CallOverlay />
    </CallContext.Provider>
  );
}
