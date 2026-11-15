// CreateGroupModal.tsx
// Modal to create a new group — select members from contacts, set name + description.

import { useState } from "react";
import { X, Users, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { addGroup } from "../../redux/features/chat/groupSlice";
import groupService from "../../services/chat/groupService";
import type { UserList } from "../../types/chat/types";

const BRAND_COLOR = "var(--primary)";

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({ onClose, onGroupCreated }: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector((s) => s.chat.contacts);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleMember(userId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    if (selectedMembers.size === 0) {
      setError("Select at least one member.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await groupService.createGroup(
      name.trim(),
      description.trim(),
      Array.from(selectedMembers)
    );

    setLoading(false);

    if (res.success && res.data) {
      dispatch(addGroup(res.data));
      onGroupCreated();
      onClose();
    } else {
      setError(res.message ?? "Failed to create group.");
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
            >
              <Users className="h-4 w-4" style={{ color: BRAND_COLOR }} />
            </div>
            <p className="font-bold text-foreground text-sm">New Group</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto px-5 py-4">
          {/* Group name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Group Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Project Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-transparent bg-muted text-sm"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description{" "}
              <span className="text-muted-foreground normal-case font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-transparent bg-muted text-sm"
            />
          </div>

          {/* Member selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Add Members{" "}
              {selectedMembers.size > 0 && (
                <span style={{ color: BRAND_COLOR }}>({selectedMembers.size} selected)</span>
              )}
            </label>

            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto rounded-xl border border-border">
              {contacts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No contacts available</p>
              ) : (
                contacts.map((user: UserList) => {
                  const selected = selectedMembers.has(user._id);
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleMember(user._id)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-primary/5 ${
                        selected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      {/* Checkmark */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected
                            ? "border-transparent"
                            : "border-input"
                        }`}
                        style={selected ? { backgroundColor: BRAND_COLOR } : {}}
                      >
                        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-5 py-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground text-sm"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim() || selectedMembers.size === 0}
            className="text-sm text-white rounded-xl px-5"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>
    </div>
  );
}