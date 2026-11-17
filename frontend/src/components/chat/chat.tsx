// Chat.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Send,
  Search,
  Phone,
  Video,
  ArrowLeft,
  Users,
  Plus,
  Briefcase,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ChatComposer, {
  ChatAttachmentPayload,
} from "./ChatComposer";
import MessageContent from "./MessageContent";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  setContacts,
  setSelectedContact,
  setMessages,
  addMessage,
  replaceMessage,
  markMessageError,
  markMessagesSeen,
  markMessageDelivered,
  incrementContactUnread,
  resetContactUnread,
} from "../../redux/features/chat/chatSlice";
import {
  setGroups,
  setSelectedGroup,
  markGroupMessageDelivered,
  incrementGroupUnread,
  resetGroupUnread,
} from "../../redux/features/chat/groupSlice";
import type {
  ChatMessage,
  Group,
  SharedPostPayload,
  UserList,
} from "../../types/chat/types";
import chatService from "../../services/chat/chatService";
import groupService from "../../services/chat/groupService";
import { socket } from "../../socket/socket";
import { useCall } from "../../context/call/callContext";
import GroupChat from "../chat/GroupChat";
import CreateGroupModal from "../../components/chat/CreateGroupModal";
import ContactInfoModal from "./ContactInfoModal";

const BRAND_COLOR = "var(--primary)";

function getUserIdFromToken(token?: string | null): string {
  if (!token) return "";
  try {
    const payloadPart = token.split(".")[1] ?? "";
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    return payload.id || payload._id || "";
  } catch {
    return "";
  }
}

function Avatar({
  initials,
  src,
  online,
  size = "md",
}: {
  initials: string;
  src?: string | null;
  online?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div className="relative shrink-0">
      {src ? (
        <img
          src={src}
          alt={initials}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white`}
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
            online ? "bg-success" : "bg-muted"
          }`}
        />
      )}
    </div>
  );
}

export default function Chat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { startCall } = useCall();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const targetGroupId = searchParams.get("groupId");

  const authUser = useAppSelector((s) => s.auth.user);
  const authToken = useAppSelector((s) => s.auth.token) || authUser?.token || "";
  const currentUserId =
    authUser?._id ||
    authUser?.id ||
    getUserIdFromToken(authToken) ||
    getUserIdFromToken(authUser?.token) ||
    "";

  const messages = useAppSelector((s) => s.chat.messages);
  const contacts = useAppSelector((s) => s.chat.contacts);
  const selectedContact = useAppSelector((s) => s.chat.selectedContact);
  const groups = useAppSelector((s) => s.group.groups);
  const selectedGroup = useAppSelector((s) => s.group.selectedGroup);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedContactRef = useRef<UserList | null>(null);
  const selectedGroupRef = useRef<string | null>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup?._id ?? null;
  }, [selectedGroup?._id]);

  // If a conversation is already selected when the chat screen opens (for
  // example after tapping "Message" on a profile), go straight to it on
  // mobile instead of showing the contact list first.
  useEffect(() => {
    if (selectedContact || selectedGroup) {
      setShowSidebar(false);
    }

    if (selectedContact) {
      dispatch(resetContactUnread(selectedContact._id));
    }

    if (selectedGroup) {
      dispatch(resetGroupUnread(selectedGroup._id));
    }
  }, [selectedContact?._id, selectedGroup?._id, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch contacts
  useEffect(() => {
    if (contacts.length > 0) return;
    async function fetchUsers() {
      const result = await chatService.getUsers();
      if (result.success && result.data) dispatch(setContacts(result.data));
    }
    fetchUsers();
  }, [dispatch, contacts.length]);

  // Fetch groups
  useEffect(() => {
    async function fetchGroups() {
      const result = await groupService.getMyGroups();
      if (result.success && result.data) dispatch(setGroups(result.data));
    }
    fetchGroups();
  }, [dispatch]);

  // Deep-link from a message notification into the right conversation.
  useEffect(() => {
    if (targetGroupId && groups.length > 0) {
      const group = groups.find((item) => item._id === targetGroupId);

      if (group) {
        dispatch(setSelectedGroup(group));
        dispatch(setSelectedContact(null));
        dispatch(resetGroupUnread(group._id));
        setShowSidebar(false);
      }

      return;
    }

    if (targetUserId && contacts.length > 0) {
      const contact = contacts.find((item) => item._id === targetUserId);

      if (contact) {
        dispatch(setSelectedContact(contact));
        dispatch(setSelectedGroup(null));
        dispatch(resetContactUnread(contact._id));
        setShowSidebar(false);
        setIsTyping(false);
      }
    }
  }, [targetUserId, targetGroupId, groups, contacts, dispatch]);

  // Fetch DM messages
  useEffect(() => {
    if (!selectedContact) return;

    async function fetchMessages() {
      if (!selectedContact) return;
      const res = await chatService.getMessages(selectedContact._id);
      if (res.success && res.data) {
        const loaded: ChatMessage[] = res.data.map((m) => ({
          ...m,
          status: "sent" as const,
        }));
        dispatch(setMessages(loaded));

        const unreadIds = loaded
          .filter((m) => m.senderId === selectedContact._id && !m.seen)
          .map((m) => m._id);

        if (unreadIds.length > 0) {
          socket.emit("mark_seen", {
            messageIds: unreadIds,
            senderId: selectedContact._id,
          });
        }

        dispatch(resetContactUnread(selectedContact._id));
      }
    }
    fetchMessages();
  }, [selectedContact?._id, dispatch]);

  // Socket
  useEffect(() => {
    if (!currentUserId || !authToken) return;

    const previousToken = (socket.auth as { token?: string } | undefined)
      ?.token;
    socket.auth = { token: authToken };

    if (!socket.connected) {
      socket.connect();
    } else if (previousToken && previousToken !== authToken) {
      socket.disconnect();
      socket.connect();
    }

    function onMessageSent(payload: ChatMessage) {
      dispatch(replaceMessage({ ...payload, status: "sent" }));
    }

    function onReceiveMessage(payload: ChatMessage) {
      if (payload.senderId === currentUserId) return;

      const contact = selectedContactRef.current;

      if (!contact || payload.senderId !== contact._id) {
        dispatch(incrementContactUnread(payload.senderId));
        return;
      }

      dispatch(addMessage({ ...payload, status: "sent" }));
      dispatch(resetContactUnread(payload.senderId));

      socket.emit("mark_seen", {
        messageIds: [payload._id],
        senderId: payload.senderId,
      });
    }

    function onReceiveGroupMessage(payload: { groupId: string; senderId?: string }) {
      if (payload.senderId === currentUserId) return;

      if (selectedGroupRef.current !== payload.groupId) {
        dispatch(incrementGroupUnread(payload.groupId));
      }
    }

    function onMessagesSeen({ messageIds }: { messageIds: string[] }) {
      dispatch(markMessagesSeen(messageIds));
    }

    function onMessageDelivered({ messageId }: { messageId?: string }) {
      if (messageId) dispatch(markMessageDelivered(messageId));
    }

    function onGroupMessageDelivered({ messageId }: { messageId?: string }) {
      if (messageId) dispatch(markGroupMessageDelivered(messageId));
    }

    function onUserStatus({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    }

    function onOnlineUsers(userIds: string[]) {
      setOnlineUsers(new Set(userIds));
    }

    function onTyping({ from }: { from: string }) {
      if (selectedContactRef.current?._id === from) setIsTyping(true);
    }

    function onStopTyping({ from }: { from: string }) {
      if (selectedContactRef.current?._id === from) setIsTyping(false);
    }

    function onMessageError({
      tempId,
      message,
    }: {
      tempId: string;
      message?: string;
    }) {
      dispatch(markMessageError(tempId));
      if (message) toast.error(message);
    }

    socket.on("message_sent", onMessageSent);
    socket.on("receive_message", onReceiveMessage);
    socket.on("receive_group_message", onReceiveGroupMessage);
    socket.on("messages_seen", onMessagesSeen);
    socket.on("message_delivered", onMessageDelivered);
    socket.on("group_message_delivered", onGroupMessageDelivered);
    socket.on("user_status", onUserStatus);
    socket.on("online_users", onOnlineUsers);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("message_error", onMessageError);

    socket.emit("get_online_users");

    return () => {
      socket.off("message_sent", onMessageSent);
      socket.off("receive_message", onReceiveMessage);
      socket.off("receive_group_message", onReceiveGroupMessage);
      socket.off("messages_seen", onMessagesSeen);
      socket.off("message_delivered", onMessageDelivered);
      socket.off("group_message_delivered", onGroupMessageDelivered);
      socket.off("user_status", onUserStatus);
      socket.off("online_users", onOnlineUsers);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("message_error", onMessageError);
    };
  }, [currentUserId, authToken, dispatch]);

  function selectContact(user: UserList) {
    dispatch(setSelectedContact(user));
    dispatch(setSelectedGroup(null));
    dispatch(resetContactUnread(user._id));
    setShowSidebar(false);
    setIsTyping(false);
  }

  function selectGroup(group: Group) {
    dispatch(setSelectedGroup(group));
    dispatch(setSelectedContact(null));
    dispatch(resetGroupUnread(group._id));
    setShowSidebar(false);
  }

  function emitMessage(payload: {
    
    text?: string;
    type?: ChatMessage["type"];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    postId?: string;
    postContent?: string;
    postMedia?: string;
    postAuthorName?: string;
  }) {
    if (!selectedContact || !currentUserId) return;

    const tempId = `temp_${Date.now()}`;
    const text = payload.text ?? "";

    const optimistic: ChatMessage = {
      _id: tempId,
      tempId,
      senderId: currentUserId,
      receiverId: selectedContact._id,
      text,
      type: payload.type ?? "text",
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      mimeType: payload.mimeType,
      postId: payload.postId,
      postContent: payload.postContent,
      postMedia: payload.postMedia,
      postAuthorName: payload.postAuthorName,
      seen: false,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    dispatch(addMessage(optimistic));
    socket.emit("send_message", {
      receiverId: selectedContact._id,
      tempId,
      ...payload,
      text,
    });
  }

  function sendMessage() {
  if (!newMessage.trim()) return;

  const text = newMessage.trim();
  emitMessage({ text, type: "text" });
  setNewMessage("");
}

  function sendSticker(sticker: string) {
    emitMessage({ text: sticker, type: "sticker" });
  }

  function sendAttachment(payload: ChatAttachmentPayload) {
    const caption = newMessage.trim();
    if (caption) setNewMessage("");

    emitMessage({
      text: caption,
      type: payload.type,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      mimeType: payload.mimeType,
    });
  }

  function sendPost(post: SharedPostPayload) {
    const caption = newMessage.trim();
    if (caption) setNewMessage("");

    emitMessage({
      text: caption,
      type: "post",
      postId: post.postId,
      postContent: post.postContent,
      postMedia: post.postMedia,
      postAuthorName: post.postAuthorName,
    });
  }

  function handleInputChange(value: string) {
    setNewMessage(value);
    if (!selectedContact || !currentUserId) return;

    socket.emit("typing", {
      to: selectedContact._id,
      from: currentUserId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        to: selectedContact._id,
        from: currentUserId,
      });
    }, 1500);
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nothingSelected = !selectedContact && !selectedGroup;

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background font-sans">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden md:flex"
        } h-full min-h-0 w-full shrink-0 flex-col border-r border-border/70 bg-card md:w-80 xl:w-[360px]`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <p className="text-lg font-extrabold text-foreground [font-family:var(--font-display)]">Chats</p>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            onClick={() => setShowCreateGroup(true)}
            aria-label="Create new group"
            title="New group"
          >
            <Users className="h-5 w-5" />
            <Plus className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-card" />
          </Button>
        </div>

        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-transparent bg-muted pl-9 text-sm"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredContacts.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => selectContact(user)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                selectedContact?._id === user._id ? "bg-primary/10" : ""
              }`}
            >
              <Avatar
                initials={user.name.substring(0, 2).toUpperCase()}
                src={user.profileImage}
                online={onlineUsers.has(user._id)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.profession || "Member"}
                </p>
              </div>
              {(user.unreadCount ?? 0) > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {user.unreadCount}
                </span>
              )}
            </button>
          ))}

          {filteredGroups.map((group) => (
            <button
              key={group._id}
              type="button"
              onClick={() => selectGroup(group)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                selectedGroup?._id === group._id ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
              >
                <Users className="h-5 w-5" style={{ color: BRAND_COLOR }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {group.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                </p>
              </div>
              {(group.unreadCount ?? 0) > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {group.unreadCount}
                </span>
              )}
            </button>
          ))}

          {filteredContacts.length === 0 && filteredGroups.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-2 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-5 w-5" style={{ color: BRAND_COLOR }} />
              </div>
              <p className="text-sm font-semibold text-foreground">No chats found</p>
              <p className="text-xs text-muted-foreground">
                Connect with people or create a group to start chatting.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-1 gap-1.5"
                onClick={() => navigate("/investors")}
              >
                <Briefcase className="h-4 w-4" /> Discover investors
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`${
          showSidebar ? "hidden md:flex" : "flex"
        } min-h-0 h-full min-w-0 flex-1 flex-col bg-muted/20`}
      >
        {selectedGroup && (
          <GroupChat
            selectedGroup={selectedGroup}
            onBack={() => setShowSidebar(true)}
          />
        )}

        {/* DM Chat */}
        {selectedContact && !selectedGroup && (
          <div className="flex h-full min-h-0 flex-col">
            {/* Header - Fixed */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/70 bg-card px-4 py-3 shadow-sm">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="mr-1 text-muted-foreground hover:text-foreground md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowContactInfo(true)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-colors hover:bg-muted/40"
                aria-label={`View ${selectedContact.name}'s profile`}
              >
                <Avatar
                  initials={selectedContact.name.substring(0, 2).toUpperCase()}
                  src={selectedContact.profileImage}
                  online={onlineUsers.has(selectedContact._id)}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {selectedContact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isTyping ? (
                      <span className="text-primary italic">typing...</span>
                    ) : onlineUsers.has(selectedContact._id) ? (
                      "Online"
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    void startCall({
                      callType: "audio",
                      targetUserId: selectedContact._id,
                    })
                  }
                  aria-label={`Call ${selectedContact.name}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    void startCall({
                      callType: "video",
                      targetUserId: selectedContact._id,
                    })
                  }
                  aria-label={`Video call ${selectedContact.name}`}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isMe = message.senderId === currentUserId;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <div className="mr-2 mt-auto">
                          <Avatar
                            initials={selectedContact.name
                              .charAt(0)
                              .toUpperCase()}
                            src={selectedContact.profileImage}
                            size="sm"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
                          isMe
                            ? "rounded-br-sm text-white shadow-sm"
                            : "rounded-bl-sm border border-border/70 bg-card text-foreground shadow-sm"
                        } ${message.status === "error" ? "opacity-50" : ""}`}
                        style={isMe ? { backgroundColor: BRAND_COLOR } : {}}
                      >
                        <MessageContent message={message} isMe={isMe} />
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-[10px] ${
                              isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                          {isMe && (
                            <span className="text-primary-foreground/80">
                              {message.status === "sending" ? (
                                <Clock className="h-3.5 w-3.5" aria-label="Sending" />
                              ) : message.status === "error" ? (
                                <AlertCircle className="h-3.5 w-3.5" aria-label="Failed" />
                              ) : message.seen ? (
                                <CheckCheck
                                  className="h-3.5 w-3.5 text-sky-300"
                                  aria-label="Read"
                                />
                              ) : message.delivered ? (
                                <CheckCheck className="h-3.5 w-3.5" aria-label="Delivered" />
                              ) : (
                                <Check className="h-3.5 w-3.5" aria-label="Sent" />
                              )}
                            </span>
                          )}
                          {message.status === "error" && (
                            <span className="text-[10px] text-destructive ml-1">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                    <Send className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No messages yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Say hi to start the conversation!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <ChatComposer
              value={newMessage}
              onChange={handleInputChange}
              onSend={sendMessage}
              onSendSticker={sendSticker}
              onSendAttachment={sendAttachment}
              onSendPost={sendPost}
              placeholder="Type a message..."
            />
          </div>
        )}

        {/* Nothing selected */}
        {nothingSelected && (
          <div className="hidden flex-1 flex-col items-center justify-center gap-3 p-8 text-center md:flex">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
              <Send className="h-7 w-7" style={{ color: BRAND_COLOR }} />
            </div>
            <p className="text-lg font-extrabold text-foreground">
              Your Messages
            </p>
            <p className="text-sm text-muted-foreground">
              Select a conversation or group to start chatting.
            </p>
          </div>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={() => {
            groupService.getMyGroups().then((res) => {
              if (res.success && res.data) dispatch(setGroups(res.data));
            });
          }}
        />
      )}

      {selectedContact && showContactInfo && (
        <ContactInfoModal
          contact={selectedContact}
          onClose={() => setShowContactInfo(false)}
        />
      )}
    </div>
  );
}