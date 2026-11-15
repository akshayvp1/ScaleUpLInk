import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useCall } from "../../context/call/callContext";
import type { CallParticipant, CallType } from "../../types/call/call.types";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function initials(name: string): string {
  return name.trim().substring(0, 2).toUpperCase() || "?";
}

interface ParticipantTileProps {
  participant: CallParticipant;
  stream?: MediaStream;
  callType: CallType;
  isLocal: boolean;
  muted: boolean;
  cameraOff: boolean;
  speakerMuted: boolean;
}

function ParticipantTile({
  participant,
  stream,
  callType,
  isLocal,
  muted,
  cameraOff,
  speakerMuted,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideoTrack = Boolean(
    stream
      ?.getVideoTracks()
      .some((track) => track.readyState !== "ended" && track.enabled !== false)
  );
  const showVideo = callType === "video" && !cameraOff && hasVideoTrack;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const tryPlay = () => {
      void video.play().catch(() => {
        // Autoplay can be blocked until the user interacts with the page.
      });
    };

    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay);

    return () => {
      video.removeEventListener("loadedmetadata", tryPlay);

      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || speakerMuted) return;

    void video.play().catch(() => {});
  }, [speakerMuted]);

  return (
    <div className="relative flex min-h-[160px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      {stream && (
        <video
          ref={videoRef}
          data-call-media="true"
          autoPlay
          playsInline
          muted={isLocal || speakerMuted}
          className={
            showVideo
              ? `h-full w-full object-cover ${isLocal ? "-scale-x-100" : ""}`
              : "hidden"
          }
        />
      )}

      {!showVideo && (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
          {initials(participant.name)}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
        <span className="min-w-0 truncate text-xs font-medium text-white">
          {participant.name || "Participant"}
          {isLocal ? " (You)" : ""}
        </span>
        {muted && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
            <MicOff className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function CallOverlay() {
  const {
    activeCall,
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isSpeakerMuted,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
  } = useCall();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAt = activeCall?.startedAt;

  useEffect(() => {
    if (!startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const isCallActive = Boolean(activeCall);

  useEffect(() => {
    if (!isCallActive) return;

    const resumePlayback = () => {
      document
        .querySelectorAll<HTMLVideoElement>('video[data-call-media="true"]')
        .forEach((video) => {
          void video.play().catch(() => {});
        });
    };

    window.addEventListener("pointerdown", resumePlayback, true);
    window.addEventListener("keydown", resumePlayback, true);

    return () => {
      window.removeEventListener("pointerdown", resumePlayback, true);
      window.removeEventListener("keydown", resumePlayback, true);
    };
  }, [isCallActive]);

  if (!activeCall) return null;

  const isGroup = activeCall.isGroup;
  const callTitle = isGroup
    ? activeCall.groupName || "Group call"
    : activeCall.callType === "video"
    ? "Video call"
    : "Audio call";

  const statusText = activeCall.startedAt
    ? formatDuration(elapsedSeconds)
    : activeCall.direction === "outgoing"
    ? "Calling..."
    : "Connecting...";

  const participants = activeCall.participants;
  const remoteCount = participants.filter((participant) => !participant.isLocal)
    .length;
  const gridClass =
    participants.length <= 1
      ? "grid-cols-1"
      : participants.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-slate-950/95 text-white backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isGroup && <Users className="h-4 w-4 shrink-0 text-primary" />}
            <p className="truncate text-sm font-bold">{callTitle}</p>
          </div>
          <p className="text-xs text-white/60">
            {statusText}
            {isGroup && remoteCount > 0
              ? ` · ${remoteCount + 1} participants`
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={endCall}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-red-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-3.5 w-3.5" />
          {isGroup ? "Leave" : "End"}
        </button>
      </div>

      <div
        className={`grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 ${gridClass}`}
      >
        {participants.map((participant) => {
          const isLocal = Boolean(participant.isLocal);
          const participantMuted = isLocal ? isMuted : Boolean(participant.muted);
          const participantCameraOff = isLocal
            ? isCameraOff
            : Boolean(participant.cameraOff);

          return (
            <ParticipantTile
              key={participant.userId}
              participant={participant}
              stream={
                isLocal
                  ? localStream ?? undefined
                  : remoteStreams[participant.userId]
              }
              callType={activeCall.callType}
              isLocal={isLocal}
              muted={participantMuted}
              cameraOff={participantCameraOff}
              speakerMuted={isSpeakerMuted}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 px-4 py-4 sm:gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isMuted
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={isMuted}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          disabled={activeCall.callType !== "video"}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            isCameraOff
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          aria-pressed={isCameraOff}
          title={
            activeCall.callType === "video"
              ? isCameraOff
                ? "Camera on"
                : "Camera off"
              : "Camera is unavailable in audio calls"
          }
        >
          {isCameraOff ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleSpeaker}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isSpeakerMuted
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isSpeakerMuted ? "Turn speaker on" : "Turn speaker off"}
          aria-pressed={isSpeakerMuted}
          title={isSpeakerMuted ? "Speaker on" : "Speaker off"}
        >
          {isSpeakerMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={endCall}
          className="flex h-12 w-14 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
          aria-label={isGroup ? "Leave call" : "End call"}
          title={isGroup ? "Leave call" : "End call"}
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
