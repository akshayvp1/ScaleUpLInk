import { useEffect, useState } from "react";
import { ImageOff, Loader2, Share2, X } from "lucide-react";

import { Button } from "../../components/ui/button";
import postService from "../../services/post/postService";
import type { Post } from "../../types/post/post.types";
import type { SharedPostPayload } from "../../types/chat/types";
import { useAppSelector } from "../../redux/hooks";

interface SharePostModalProps {
  onClose: () => void;
  onSelect: (post: SharedPostPayload) => void;
}

function getAuthorName(post: Post, fallback: string): string {
  if (typeof post.userid === "object" && post.userid !== null) {
    return post.userid.name || fallback;
  }

  return fallback;
}

export default function SharePostModal({
  onClose,
  onSelect,
}: SharePostModalProps) {
  const currentUserName = useAppSelector(
    (state) => state.auth.user?.name ?? ""
  );

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setIsLoading(true);
      setError("");

      try {
        const result = await postService.getUsersPosts();

        if (active) {
          setPosts(result.filter((post) => Boolean(post._id)));
        }
      } catch {
        if (active) {
          setError("Could not load posts. Please try again.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Share a post</p>
              <p className="text-xs text-muted-foreground">
                Send a clickable post preview
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ImageOff className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No posts to share
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Create a post first, then share it in a conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => {
                const postId = post._id as string;
                const media = post.media?.[0];

                return (
                  <button
                    key={postId}
                    type="button"
                    onClick={() =>
                      onSelect({
                        postId,
                        postContent: (post.content || "Shared post").slice(
                          0,
                          500
                        ),
                        postMedia: media,
                        postAuthorName: getAuthorName(
                          post,
                          currentUserName || "Member"
                        ),
                      })
                    }
                    className="flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {media ? (
                      <img
                        src={media}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Share2 className="h-5 w-5" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground">
                        {getAuthorName(post, currentUserName || "Member")}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-sm text-muted-foreground">
                        {post.content || "Shared post"}
                      </span>
                      {post.createdAt && (
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t border-border bg-muted/20 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
