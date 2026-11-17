

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ChatMessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "sticker"
  | "post"
  | "event";

export interface SharedPostPayload {
  postId: string;
  postContent: string;
  postMedia?: string;
  postAuthorName?: string;
}

export interface SharedEventPayload {
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventStartDate?: string;
  eventStartTime?: string;
  eventVenue?: string;
  eventCity?: string;
}

export interface ChatMessage {
  _id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  text: string;
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
  seen: boolean;
  delivered?: boolean;
  createdAt: string;
  updatedAt?: string;
  status?: "sending" | "sent" | "error";
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface UserList {
  _id: string;
  name: string;
  email?: string;
  profession?: string;
  role?: string;
  profileImage?: string;
  lastSeen?: string | null;
  unreadCount?: number;
}

export interface LogoutResponse {
  message: string;
}

// kept for backward compat if used elsewhere
export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
  seen: boolean;
}




export interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  admin: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface GroupMessage {
  _id: string;
  tempId?: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
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
  seenBy: string[];
  delivered?: boolean;
  createdAt: string;
  status?: "sending" | "sent" | "error";
}