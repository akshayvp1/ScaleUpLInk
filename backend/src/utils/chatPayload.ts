import {
  ChatMessagePayload,
  ChatMessageType,
  NormalizedChatMessagePayload,
} from "../interfaces/IMessage";

const ALLOWED_TYPES: ChatMessageType[] = [
  "text",
  "image",
  "video",
  "file",
  "sticker",
  "post",
];

/**
 * Normalizes and validates a chat message coming from the REST API or a
 * Socket.IO event. Text-only strings remain supported for backwards
 * compatibility with the existing emitters.
 */
export const normalizeChatPayload = (
  input: string | ChatMessagePayload
): NormalizedChatMessagePayload => {
  const raw: ChatMessagePayload =
    typeof input === "string" ? { text: input } : input ?? {};

  const type: ChatMessageType = raw.type ?? "text";

  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error("Invalid message type");
  }

  const text = (raw.text ?? "").trim();

  if (text.length > 5000) {
    throw new Error("Message is too long");
  }

  if (type === "text" || type === "sticker") {
    if (!text) {
      throw new Error("Message text is required");
    }

    return { text, type };
  }

  if (type === "post") {
    const postId = raw.postId?.trim();

    if (!postId || !/^[a-f\d]{24}$/i.test(postId)) {
      throw new Error("Invalid post");
    }

    return { text, type, postId };
  }

  const fileUrl = raw.fileUrl?.trim();

  if (!fileUrl) {
    throw new Error("Attachment is required");
  }

  if (!/^(https?:\/\/|data:)/i.test(fileUrl)) {
    throw new Error("Invalid attachment");
  }

  if (fileUrl.length > 8_000_000) {
    throw new Error("Attachment is too large");
  }

  return {
    text,
    type,
    fileUrl,
    fileName: raw.fileName?.slice(0, 255),
    fileSize:
      typeof raw.fileSize === "number" && Number.isFinite(raw.fileSize)
        ? raw.fileSize
        : undefined,
    mimeType: raw.mimeType?.slice(0, 120),
  };
};
