import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { RootState } from "../../redux/app/store";
import { setSelectedContact } from "../../redux/features/chat/chatSlice";
import { setSelectedGroup } from "../../redux/features/chat/groupSlice";
import type { UserList } from "../../types/chat/types";
import investorService, {
  InvestorListResult,
  InvestorSummary,
} from "../../services/investor/investorService";
import postService, {
  ConnectionStatusResult,
} from "../../services/post/postService";

const PAGE_SIZE = 12;

const getInitials = (name?: string) => {
  const source = name?.trim() || "Investor";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

function InvestorAvatar({ investor }: { investor: InvestorSummary }) {
  const [broken, setBroken] = useState(false);

  if (investor.profileImage && !broken) {
    return (
      <img
        src={investor.profileImage}
        alt={investor.name}
        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-border"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary ring-1 ring-primary/20">
      {getInitials(investor.name)}
    </div>
  );
}

export default function InvestorDiscovery() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = authUser?._id || authUser?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "name" | "company">("newest");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<InvestorListResult>({
    investors: [],
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<
    Record<string, ConnectionStatusResult>
  >({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadInvestors = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const data = await investorService.discover({
        search: debouncedSearch || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      });

      if (requestId === requestIdRef.current) {
        setResult(data);
      }
    } catch (err) {
      console.error("Failed to load investors:", err);
      if (requestId === requestIdRef.current) {
        setError("We couldn't load investors right now. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, sort, page]);

  useEffect(() => {
    loadInvestors();
  }, [loadInvestors]);

  const investorIds = useMemo(
    () => result.investors.map((investor) => investor._id),
    [result.investors]
  );

  useEffect(() => {
    if (!currentUserId || investorIds.length === 0) return;

    let cancelled = false;

    const loadStatuses = async () => {
      const entries = await Promise.all(
        investorIds.map(async (id) => {
          try {
            const status = await postService.getConnectionStatus(id);
            return [id, status] as const;
          } catch {
            return [id, { status: "none" } as ConnectionStatusResult] as const;
          }
        })
      );

      if (!cancelled) {
        setStatuses((previous) => ({
          ...previous,
          ...Object.fromEntries(entries),
        }));
      }
    };

    loadStatuses();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, investorIds]);

  const withBusy = async (id: string, action: () => Promise<void>) => {
    setBusyIds((previous) => new Set(previous).add(id));

    try {
      await action();
    } catch (err) {
      console.error("Connection action failed:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusyIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
  };

  const handleConnect = (investor: InvestorSummary) => {
    withBusy(investor._id, async () => {
      const created = await postService.sendConnectionRequest(investor._id);
      setStatuses((previous) => ({
        ...previous,
        [investor._id]: {
          status: "pending",
          connectionId: created._id,
          isRequester: true,
        },
      }));
      toast.success(`Connection request sent to ${investor.name}`);
    });
  };

  const handleCancel = (investor: InvestorSummary) => {
    const connectionId = statuses[investor._id]?.connectionId;
    if (!connectionId) return;

    withBusy(investor._id, async () => {
      await postService.cancelConnectionRequest(connectionId);
      setStatuses((previous) => ({
        ...previous,
        [investor._id]: { status: "none" },
      }));
    });
  };

  const handleRespond = (investor: InvestorSummary, accept: boolean) => {
    const connectionId = statuses[investor._id]?.connectionId;
    if (!connectionId) return;

    withBusy(investor._id, async () => {
      await postService.respondToConnectionRequest(connectionId, accept);
      setStatuses((previous) => ({
        ...previous,
        [investor._id]: {
          status: accept ? "accepted" : "rejected",
          connectionId,
        },
      }));
      toast.success(
        accept
          ? `You're now connected with ${investor.name}`
          : "Request ignored"
      );
    });
  };

  const handleMessage = (investor: InvestorSummary) => {
    const contact: UserList = {
      _id: investor._id,
      name: investor.name,
      profession: investor.profession,
      profileImage: investor.profileImage,
      role: investor.role,
    };

    dispatch(setSelectedGroup(null));
    dispatch(setSelectedContact(contact));
    navigate("/chat");
  };

  const renderAction = (investor: InvestorSummary) => {
    const status = statuses[investor._id] ?? { status: "none" as const };
    const isBusy = busyIds.has(investor._id);

    if (status.status === "accepted") {
      return (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => handleMessage(investor)}
        >
          <MessageCircle className="h-4 w-4" /> Message
        </Button>
      );
    }

    if (status.status === "pending" && status.isRequester) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={isBusy}
          onClick={() => handleCancel(investor)}
        >
          <Clock className="h-4 w-4" /> Pending
        </Button>
      );
    }

    if (status.status === "pending" && !status.isRequester) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={isBusy}
            onClick={() => handleRespond(investor, true)}
          >
            <Check className="h-4 w-4" /> Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={() => handleRespond(investor, false)}
            aria-label="Ignore request"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        className="gap-1.5"
        disabled={isBusy}
        onClick={() => handleConnect(investor)}
      >
        <UserPlus className="h-4 w-4" /> Connect
      </Button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Investor network
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground [font-family:var(--font-display)] md:text-3xl">
            Discover investors
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Find investors who match your stage and industry, send a connection
            request, and unlock direct messaging once they accept.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, company, focus..."
              className="rounded-xl bg-muted pl-9"
              aria-label="Search investors"
            />
          </div>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as "newest" | "name" | "company");
              setPage(1);
            }}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-primary"
            aria-label="Sort investors"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A-Z</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading
            ? "Loading investors..."
            : `${result.total} investor${result.total === 1 ? "" : "s"} found`}
        </span>
        {result.total > 0 && (
          <span>
            Page {result.page} of {result.totalPages}
          </span>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="mb-3 text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={loadInvestors}>
            Try again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : result.investors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold text-foreground">No investors found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different name, company, or focus area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.investors.map((investor) => (
            <article
              key={investor._id}
              className="flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float"
              onClick={() => navigate(`/profile/${investor._id}`)}
            >
              <div className="flex items-start gap-3">
                <InvestorAvatar investor={investor} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold text-foreground">
                    {investor.name}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {investor.profession || "Investor"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">
                    {investor.investorDetails?.companyName || "Independent investor"}
                  </span>
                </p>
                {investor.investorDetails?.companyFounded && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    Founded {investor.investorDetails.companyFounded}
                  </p>
                )}
              </div>

              <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                {investor.bio || "No bio added yet."}
              </p>

              {investor.interests && investor.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {investor.interests.slice(0, 3).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              <div
                className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-4"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate(`/profile/${investor._id}`)}
                >
                  View profile
                </Button>
                {renderAction(investor)}
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && result.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={page <= 1}
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {result.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={page >= result.totalPages}
            onClick={() =>
              setPage((previous) => Math.min(result.totalPages, previous + 1))
            }
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading && result.investors.length > 0 && (
        <div className="mt-4 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
