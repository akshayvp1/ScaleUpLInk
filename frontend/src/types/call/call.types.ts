export type CallType = "audio" | "video";

export interface CallParticipant {
  userId: string;
  name: string;
  muted?: boolean;
  cameraOff?: boolean;
  isLocal?: boolean;
}

export interface IncomingCall {
  callId: string;
  callType: CallType;
  isGroup: boolean;
  groupId?: string;
  groupName?: string;
  callerId: string;
  callerName: string;
  callerImage?: string | null;
}

export interface CallSession {
  callId: string;
  callType: CallType;
  isGroup: boolean;
  groupId?: string;
  groupName?: string;
  direction: "outgoing" | "incoming";
  status: "ringing" | "connecting" | "active";
  participants: CallParticipant[];
  startedAt?: number;
}

export interface StartCallInput {
  callType: CallType;
  targetUserId?: string;
  groupId?: string;
  groupName?: string;
}

export interface CallContextValue {
  activeCall: CallSession | null;
  incomingCall: IncomingCall | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerMuted: boolean;
  startCall: (input: StartCallInput) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
}
