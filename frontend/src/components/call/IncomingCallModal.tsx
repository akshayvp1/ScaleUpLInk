import { useState } from "react";
import { Phone, PhoneOff, Users, Video } from "lucide-react";

import { useCall } from "../../context/call/callContext";
import { Button } from "../ui/button";

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const [isAccepting, setIsAccepting] = useState(false);

  if (!incomingCall) return null;

  const isVideo = incomingCall.callType === "video";
  const title = incomingCall.isGroup
    ? incomingCall.groupName || "Group call"
    : incomingCall.callerName || "Unknown caller";

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      await acceptCall();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[120] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-card p-4 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={`Incoming ${isVideo ? "video" : "audio"} call`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {incomingCall.callerImage ? (
            <img
              src={incomingCall.callerImage}
              alt={title}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              {incomingCall.isGroup ? (
                <Users className="h-5 w-5" />
              ) : isVideo ? (
                <Video className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white ${
              isAccepting ? "animate-pulse" : ""
            }`}
          >
            {isVideo ? (
              <Video className="h-2.5 w-2.5" />
            ) : (
              <Phone className="h-2.5 w-2.5" />
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Incoming {isVideo ? "video" : "audio"} call
          </p>
          <p className="truncate text-sm font-bold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {incomingCall.isGroup
              ? `${incomingCall.callerName} is calling the group`
              : "is calling you"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={rejectCall}
          className="h-9 gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          Decline
        </Button>
        <Button
          type="button"
          onClick={handleAccept}
          disabled={isAccepting}
          className="h-9 gap-1.5 bg-success text-white hover:bg-success/90"
        >
          <Phone className="h-4 w-4" />
          {isAccepting ? "Joining..." : "Accept"}
        </Button>
      </div>
    </div>
  );
}
