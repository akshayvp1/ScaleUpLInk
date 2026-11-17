// ─── CHANGED ────────────────────────────────────────────────────────────────
// 1. Renamed setSelectedUser  → setSelectedContact  (Chat.tsx used setSelectedContact)
// 2. Renamed updateMessage    → replaceMessage       (Chat.tsx used replaceMessage)
// 3. Added    markMessageError                       (Chat.tsx used markMessageError)
// 4. Renamed clearChatState   → clearChat            (Chat.tsx used clearChat)
// 5. Removed  setOnlineUsers + onlineUsers from state
//    (online status is local UI state in Chat.tsx via useState<Set<string>>)
// 6. No `any` types used anywhere
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, UserList } from "../../../types/chat/types";

interface ChatState {
  contacts: UserList[];
  selectedContact: UserList | null;
  messages: ChatMessage[];
}

const initialState: ChatState = {
  contacts: [],
  selectedContact: null,
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setContacts: (state, action: PayloadAction<UserList[]>) => {
      state.contacts = action.payload;
    },

    // was: setSelectedUser
    setSelectedContact: (state, action: PayloadAction<UserList | null>) => {
      state.selectedContact = action.payload;
    },

    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },

    // was: updateMessage — replaces optimistic message once server confirms
    replaceMessage: (state, action: PayloadAction<ChatMessage>) => {
      const index = state.messages.findIndex(
        (msg) => msg.tempId !== undefined && msg.tempId === action.payload.tempId
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },

    // NEW — marks a message as failed so UI can show "Failed" label
    markMessageError: (state, action: PayloadAction<string>) => {
      const index = state.messages.findIndex(
        (msg) => msg.tempId === action.payload
      );
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          status: "error",
        };
      }
    },

    markMessagesSeen: (state, action: PayloadAction<string[]>) => {
      state.messages = state.messages.map((msg) =>
        action.payload.includes(msg._id) ? { ...msg, seen: true } : msg
      );
    },

    markMessageDelivered: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.map((msg) =>
        msg._id === action.payload ? { ...msg, delivered: true } : msg
      );
    },

    incrementContactUnread: (state, action: PayloadAction<string>) => {
      if (!action.payload) return;
      const contact = state.contacts.find((item) => item._id === action.payload);
      if (contact) {
        contact.unreadCount = (contact.unreadCount ?? 0) + 1;
      }
    },

    resetContactUnread: (state, action: PayloadAction<string>) => {
      const contact = state.contacts.find((item) => item._id === action.payload);
      if (contact) {
        contact.unreadCount = 0;
      }
    },

    // was: clearChatState
    clearChat: (state) => {
      state.selectedContact = null;
      state.messages = [];
      state.contacts = [];
    },
  },
});

export const {
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
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;