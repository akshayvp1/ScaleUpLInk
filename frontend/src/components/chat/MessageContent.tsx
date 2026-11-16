import { Calendar, Download, ExternalLink, FileText, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { ChatMessageType } from "../../types/chat/types";
import {
  downloadAttachment,
  getAttachmentName,
  getFileTypeLabel,
  openAttachment,
} from "../../utils/fileAttachment";

interface MessageContentProps {
  message: {
    text: string;
    senderId?: string;
    type?: ChatMessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    postId?: string;
    postContent?: string;
    postMedia?: string;
    postAuthorName?: string;
    eventId?: string;
    eventTitle?: string;
    eventImage?: string;
    eventStartDate?: string;
    eventStartTime?: string;
    eventVenue?: string;
    eventCity?: string;
  };
  isMe: boolean;
}

const formatSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MessageContent({ message, isMe }: MessageContentProps) {
  const type = message.type ?? "text";

  if (type === "sticker") {
    return (
      <div className="flex items-center justify-center px-2 py-1">
        <span className="text-5xl leading-none" role="img" aria-label="Sticker">
          {message.text}
        </span>
      </div>
    );
  }

  if (type === "event" && message.eventId) {
    const eventDate = message.eventStartDate
      ? new Date(message.eventStartDate)
      : null;
    const dateLabel =
      eventDate && !Number.isNaN(eventDate.getTime())
        ? format(eventDate, "EEE, MMM d, yyyy")
        : "";

    return (
      <div className="space-y-1.5">
        <Link
          to={`/events?eventId=${encodeURIComponent(message.eventId)}`}
          className={`block overflow-hidden rounded-lg border transition-colors ${
            isMe
              ? "border-white/30 bg-white/10 hover:bg-white/20"
              : "border-border bg-muted/60 hover:bg-muted"
          }`}
        >
          {message.eventImage && (
            <img
              src={message.eventImage}
              alt=""
              className="max-h-52 w-full object-cover"
            />
          )}
          <div className="space-y-1 p-2.5">
            <p
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                isMe ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              Shared event
            </p>
            <p className="line-clamp-2 text-sm font-semibold">
              {message.eventTitle || "Event"}
            </p>
            <div
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${
                isMe ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              {dateLabel && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateLabel}
                  {message.eventStartTime ? ` · ${message.eventStartTime}` : ""}
                </span>
              )}
              {message.eventVenue && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[message.eventVenue, message.eventCity]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </Link>
        <Link
          to={`/events?eventId=${encodeURIComponent(message.eventId)}`}
          className={`inline-flex items-center gap-1 text-[11px] font-medium underline-offset-2 hover:underline ${
            isMe ? "text-white/80" : "text-primary"
          }`}
        >
          <ExternalLink className="h-3 w-3" />
          Open event and book tickets
        </Link>
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
      </div>
    );
  }

  if (type === "post" && message.postId) {
    const sharedBy = message.senderId
      ? `?sharedBy=${encodeURIComponent(message.senderId)}`
      : "";

    return (
      <div className="space-y-1.5">
        <Link
          to={`/post/${message.postId}/share${sharedBy}`}
          className={`block overflow-hidden rounded-lg border transition-colors ${
            isMe
              ? "border-white/30 bg-white/10 hover:bg-white/20"
              : "border-border bg-muted/60 hover:bg-muted"
          }`}
        >
          {message.postMedia && (
            <img
              src={message.postMedia}
              alt=""
              className="max-h-52 w-full object-cover"
            />
          )}
          <div className="space-y-0.5 p-2.5">
            <p
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                isMe ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              Shared post
            </p>
            {message.postAuthorName && (
              <p className="text-xs font-semibold">{message.postAuthorName}</p>
            )}
            <p className="line-clamp-3 text-sm">
              {message.postContent || "Tap to view this post"}
            </p>
          </div>
        </Link>
        <Link
          to={`/post/${message.postId}`}
          className={`inline-flex items-center gap-1 text-[11px] font-medium underline-offset-2 hover:underline ${
            isMe ? "text-white/80" : "text-primary"
          }`}
        >
          <ExternalLink className="h-3 w-3" />
          Open original post
        </Link>
        {message.text && (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    );
  }

  if (type === "image" && message.fileUrl) {
    const imageName = getAttachmentName(message.fileName, "Shared image");

    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => openAttachment(message.fileUrl as string, imageName)}
          className="block overflow-hidden rounded-lg"
          aria-label={`Open ${imageName}`}
        >
          <img
            src={message.fileUrl}
            alt={imageName}
            className="max-h-64 w-auto max-w-full object-cover"
          />
        </button>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] opacity-80">{imageName}</p>
          <button
            type="button"
            onClick={() =>
              downloadAttachment(message.fileUrl as string, imageName)
            }
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium opacity-80 transition-opacity hover:opacity-100"
            aria-label={`Download ${imageName}`}
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
        {message.text && (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    );
  }

  if (type === "video" && message.fileUrl) {
    const videoName = getAttachmentName(message.fileName, "Shared video");
    const typeLabel = getFileTypeLabel(message.mimeType, videoName);

    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => openAttachment(message.fileUrl as string, videoName)}
          className="relative block max-w-[280px] overflow-hidden rounded-lg"
          aria-label={`Open ${videoName}`}
        >
          <video
            src={message.fileUrl}
            controls={false}
            preload="metadata"
            muted
            className="max-h-64 w-full object-cover pointer-events-none"
            tabIndex={-1}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm ${
                isMe ? "bg-black/30 text-white" : "bg-black/50 text-white"
              }`}
            >
              <Video className="h-5 w-5" />
            </span>
          </span>
        </button>
        <div
          className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 ${
            isMe ? "border-white/30 bg-white/10" : "border-border bg-muted/60"
          }`}
        >
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium">
              {videoName}
            </span>
            <span
              className={`block text-[11px] ${
                isMe ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              {[typeLabel, formatSize(message.fileSize)]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          <button
            type="button"
            onClick={() => downloadAttachment(message.fileUrl as string, videoName)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md p-1.5 text-[11px] font-medium transition-colors ${
              isMe ? "hover:bg-white/20" : "hover:bg-accent"
            }`}
            aria-label={`Download ${videoName}`}
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
        {message.text && (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    );
  }

  if (type === "file" && message.fileUrl) {
    const fileName = getAttachmentName(message.fileName, "Shared file");
    const typeLabel = getFileTypeLabel(message.mimeType, fileName);

    return (
      <div className="space-y-1.5">
        <div
          className={`flex items-center gap-2.5 rounded-lg border p-2.5 ${
            isMe
              ? "border-white/30 bg-white/10"
              : "border-border bg-muted/60"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isMe ? "bg-white/20" : "bg-primary/10 text-primary"
            }`}
          >
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {fileName}
            </span>
            <span
              className={`block text-[11px] ${
                isMe ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              {[typeLabel, formatSize(message.fileSize)]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => openAttachment(message.fileUrl as string, fileName)}
              className={`rounded-md p-1.5 transition-colors ${
                isMe ? "hover:bg-white/20" : "hover:bg-accent"
              }`}
              aria-label={`Open ${fileName}`}
              title="Open"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                downloadAttachment(message.fileUrl as string, fileName)
              }
              className={`rounded-md p-1.5 transition-colors ${
                isMe ? "hover:bg-white/20" : "hover:bg-accent"
              }`}
              aria-label={`Download ${fileName}`}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        {message.text && (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap">{message.text}</p>;
}
