import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import postService, { ShareDetails } from '../../services/post/postService';

const PostShareDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sharedBy = searchParams.get('sharedBy') ?? undefined;
  const isShareView = location.pathname.endsWith('/share');
  const navigate = useNavigate();

  const [data, setData] = useState<ShareDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setIsLoading(true);
    postService
      .getShareDetails(postId, sharedBy)
      .then(setData)
      .catch(() => setError('Could not load this shared post.'))
      .finally(() => setIsLoading(false));
  }, [postId, sharedBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-4 my-10 rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center text-sm text-muted-foreground shadow-soft">
        {error || 'Post not found.'}
      </div>
    );
  }

  const { post, share } = data;

  const author = typeof post.userid === 'string' ? null : post.userid;
  const sharer = isShareView ? share?.sharedBy ?? null : null;
  const sharedAt = isShareView ? share?.sharedAt ?? null : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {share && sharer && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <img
            src={sharer.profileImage || 'https://via.placeholder.com/28'}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
          />
          <span>
            <span className="font-semibold text-foreground">{sharer.name}</span> shared this post
            {sharedAt && (
              <>
                {' · '}
                {new Date(sharedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </>
            )}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
        <button
          type="button"
          onClick={() => author?._id && navigate(`/profile/${author._id}`)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
        >
          <img
            src={author?.profileImage || 'https://via.placeholder.com/32'}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
          <span className="text-sm font-semibold text-foreground">{author?.name}</span>
        </button>

        {post.media?.[0] && (
          <img src={post.media[0]} alt="" className="max-h-96 w-full object-cover" />
        )}

        <p className="px-3 py-2.5 text-sm text-foreground">{post.content}</p>

        <div className="flex gap-4 border-t border-border/60 px-3 py-2.5 text-xs text-muted-foreground">
          <span>{post.totalLikes} likes</span>
          <span>{data.totalShareCount} shares</span>
        </div>
      </div>
    </div>
  );
};

export default PostShareDetail;