import { useEffect, useState } from "react";
import {
  AtSign,
  Briefcase,
  Building2,
  Mail,
  Phone,
  PhoneCall,
  Video,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import authService from "../../services/user/authService";
import type { UserList } from "../../types/chat/types";
import type { IUser } from "../../types/auth/auth.types";
import { useCall } from "../../context/call/callContext";

interface ContactInfoModalProps {
  contact: UserList;
  onClose: () => void;
}

function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function formatLastSeen(lastSeen?: string | null): string {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) return "";

  return `Last seen ${date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ContactInfoModal({
  contact,
  onClose,
}: ContactInfoModalProps) {
  const { startCall } = useCall();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const fullProfile = await authService.getUserById(contact._id);
        if (!cancelled) setProfile(fullProfile);
      } catch {
        // The contact list data still renders a useful screen.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [contact._id]);

  const name = profile?.name || contact.name;
  const profileImage = profile?.profileImage || contact.profileImage;
  const email = profile?.email || contact.email;
  const profession = profile?.profession || contact.profession;
  const contactNumber = profile?.contactNumber;
  const bio = profile?.bio;
  const companyName = profile?.investorDetails?.companyName;

  const startAudioCall = () => {
    onClose();
    void startCall({ callType: "audio", targetUserId: contact._id });
  };

  const startVideoCall = () => {
    onClose();
    void startCall({ callType: "video", targetUserId: contact._id });
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} contact info`}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cover / avatar header */}
        <div className="relative">
          <div
            className="h-28 w-full"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--primary) 70%, transparent), color-mix(in srgb, var(--primary) 25%, transparent))",
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/30 p-1.5 text-white transition-colors hover:bg-black/50"
            aria-label="Close contact info"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex flex-col items-center px-6 pb-4">
            <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-primary/10 shadow-md">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
                  {initials(name)}
                </div>
              )}
            </div>
            <p className="mt-3 text-lg font-bold text-foreground [font-family:var(--font-display)]">
              {isLoading && !name ? "Loading..." : name}
            </p>
            {profession && (
              <p className="text-sm text-muted-foreground">{profession}</p>
            )}
            {formatLastSeen(contact.lastSeen) && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatLastSeen(contact.lastSeen)}
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-center gap-3 border-y border-border/70 bg-muted/30 px-6 py-3">
          <button
            type="button"
            onClick={startAudioCall}
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            aria-label={`Audio call ${name}`}
            title="Audio call"
          >
            <PhoneCall className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={startVideoCall}
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            aria-label={`Video call ${name}`}
            title="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-1 px-4 py-4">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Contact details
          </p>

          {email && (
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          )}

          {contactNumber && (
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Phone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {contactNumber}
                </p>
                <p className="text-xs text-muted-foreground">Phone</p>
              </div>
            </div>
          )}

          {companyName && (
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {profile?.role === "investor" ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <Briefcase className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {companyName}
                </p>
                <p className="text-xs text-muted-foreground">Company</p>
              </div>
            </div>
          )}

          {bio && (
            <div className="flex items-start gap-3 rounded-xl px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <AtSign className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {bio}
                </p>
                <p className="text-xs text-muted-foreground">About</p>
              </div>
            </div>
          )}

          {!email && !contactNumber && !companyName && !bio && !isLoading && (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No additional details shared yet.
            </p>
          )}
        </div>

        {/* Message shortcut */}
        <div className="border-t border-border/70 px-4 py-3">
          <p className="px-1 text-xs text-muted-foreground">
            Use the audio or video buttons above to call, or continue the
            conversation in the chat.
          </p>
        </div>

        {/* End */}
        <div className="border-t border-border/70 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
