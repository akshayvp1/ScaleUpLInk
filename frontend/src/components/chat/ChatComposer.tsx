import { useRef, useState } from "react";
import { Loader2, Paperclip, Send, Share2, Smile, Sticker } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import SharePostModal from "./SharePostModal";
import EmojiPicker from "./EmojiPicker";
import type { SharedPostPayload } from "../../types/chat/types";

const STICKERS = [
  "👍", "👏", "🎉", "🚀", "🔥", "💯", "🙌", "🤝",
  "😎", "🤩", "😍", "🥳", "💪", "🙏", "✨", "⭐",
];

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 5 * 1024 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface ChatAttachmentPayload {
  type: "image" | "video" | "file";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendSticker: (sticker: string) => void;
  onSendAttachment: (payload: ChatAttachmentPayload) => void;
  onSendPost?: (post: SharedPostPayload) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  onSendSticker,
  onSendAttachment,
  onSendPost,
  placeholder = "Type a message...",
  disabled = false,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panel, setPanel] = useState<"emoji" | "sticker" | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [showSharePost, setShowSharePost] = useState(false);

  const handleFile = (file?: File) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const limit = isImage
      ? MAX_IMAGE_BYTES
      : isVideo
      ? MAX_VIDEO_BYTES
      : MAX_FILE_BYTES;

    if (file.size > limit) {
      toast.error(
        isImage
          ? "Image is too large. Please choose one under 4 MB."
          : isVideo
          ? "Video is too large. Please choose one under 5 MB."
          : "File is too large. Please choose one under 5 MB."
      );
      return;
    }

    setIsReading(true);

    const reader = new FileReader();

    reader.onload = () => {
      setIsReading(false);

      if (typeof reader.result !== "string" || !reader.result) {
        toast.error("Could not read that file. Please try another.");
        return;
      }

      onSendAttachment({
        type: isImage ? "image" : isVideo ? "video" : "file",
        fileUrl: reader.result,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
    };

    reader.onerror = () => {
      setIsReading(false);
      toast.error("Could not read that file. Please try another.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="shrink-0 border-t border-border/70 bg-card px-3 py-3 sm:px-4">
      <div className="relative flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.csv"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isReading}
          aria-label="Attach a file"
        >
          {isReading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        {onSendPost && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowSharePost(true)}
            disabled={disabled}
            aria-label="Share a post"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}

        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            className="rounded-xl border-transparent bg-muted pl-3 pr-20 text-sm"
            disabled={disabled}
          />

          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
            <button
              type="button"
              onClick={() => setPanel(panel === "emoji" ? null : "emoji")}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Insert emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === "sticker" ? null : "sticker")}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Send a sticker"
            >
              <Sticker className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="h-9 w-9 shrink-0 rounded-full p-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>

        {panel && (
          <div
            className={`absolute bottom-full right-0 z-30 mb-2 rounded-2xl border border-border bg-card p-3 shadow-float ${
              panel === "emoji" ? "w-auto" : "w-64"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {panel === "emoji" ? "Emojis" : "Stickers"}
              </p>
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            {panel === "emoji" ? (
              <EmojiPicker
                onSelect={(emoji) => {
                  onChange(`${value}${emoji}`);
                }}
              />
            ) : (
              <div className="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    className="rounded-xl p-2 text-3xl transition-colors hover:bg-accent"
                    onClick={() => {
                      onSendSticker(sticker);
                      setPanel(null);
                    }}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSharePost && onSendPost && (
        <SharePostModal
          onClose={() => setShowSharePost(false)}
          onSelect={(post) => {
            onSendPost(post);
            setShowSharePost(false);
          }}
        />
      )}
    </div>
  );
}
