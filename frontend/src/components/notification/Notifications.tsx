
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Bell,
  Check,
  X,
} from "lucide-react";

import { toast } from "react-hot-toast";

import notificationService, {
  AppNotification,
  ConnectionStatus,
} from "../../services/notification/notificationService";

import {
  onNotificationReceived,
} from "../../services/notification/notificationEvents";

import postService from "../../services/post/postService";

const PAGE_SIZE = 20;

/* -------------------------------------------------------------------------- */
/* DISPLAY MESSAGE                                                            */
/* -------------------------------------------------------------------------- */

const getDisplayMessage = (
  notification: AppNotification
): string => {
  switch (notification.type) {
    case "like":
      return "liked your post";

    case "comment":
      return "commented on your post";

    case "follow":
      return "started following you";

    case "post_share":
      return "shared a post with you";

    case "connection_request":
      return "sent you a connection request";

    case "connection_accepted":
      return "accepted your connection request";

    case "message":
      return "sent you a message";

    default:
      return (
        notification.message ||
        "sent you a notification"
      );
  }
};

/* -------------------------------------------------------------------------- */
/* ICON                                                                       */
/* -------------------------------------------------------------------------- */

const getIcon = (
  type: AppNotification["type"]
) => {
  switch (type) {
    case "like":
      return (
        <Heart className="w-3.5 h-3.5 text-white fill-white" />
      );

    case "comment":
      return (
        <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
      );

    case "follow":
      return (
        <UserPlus className="w-3.5 h-3.5 text-white" />
      );

    case "post_share":
      return (
        <Share2 className="w-3.5 h-3.5 text-white" />
      );

    case "connection_request":
      return (
        <UserPlus className="w-3.5 h-3.5 text-white" />
      );

    case "connection_accepted":
      return (
        <Check className="w-3.5 h-3.5 text-white" />
      );

    case "message":
      return (
        <MessageCircle className="w-3.5 h-3.5 text-white" />
      );

    default:
      return (
        <Bell className="w-3.5 h-3.5 text-white" />
      );
  }
};

/* -------------------------------------------------------------------------- */
/* ICON BACKGROUND                                                            */
/* -------------------------------------------------------------------------- */

const getIconBg = (
  type: AppNotification["type"]
) => {
  switch (type) {
    case "like":
      return "bg-destructive";

    case "comment":
      return "bg-primary";

    case "follow":
      return "bg-primary";

    case "post_share":
      return "bg-primary";

    case "connection_request":
      return "bg-success";

    case "connection_accepted":
      return "bg-success";

    case "message":
      return "bg-primary";

    default:
      return "bg-muted-foreground";
  }
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getSenderImage = (
  notification: AppNotification
): string | undefined => {
  return typeof notification.sender === "object"
    ? notification.sender.profileImage
    : undefined;
};

const getSenderName = (
  notification: AppNotification
): string => {
  return typeof notification.sender === "object"
    ? notification.sender.name
    : "Someone";
};

const getSenderId = (
  notification: AppNotification
): string | undefined => {
  return typeof notification.sender === "object"
    ? notification.sender._id
    : notification.sender;
};

const getPostId = (
  notification: AppNotification
): string | undefined => {
  if (!notification.post) {
    return undefined;
  }

  return typeof notification.post === "object"
    ? notification.post._id
    : notification.post;
};

const getPostThumbnail = (
  notification: AppNotification
): string | undefined => {
  if (
    notification.post &&
    typeof notification.post === "object"
  ) {
    return notification.post.media?.[0];
  }

  return undefined;
};

const getConnectionId = (
  notification: AppNotification
): string | undefined => {
  const connection =
    notification.connection;

  if (!connection) {
    return undefined;
  }

  if (typeof connection === "string") {
    return connection;
  }

  if (
    typeof connection === "object" &&
    "_id" in connection
  ) {
    return (connection as { _id?: string })._id;
  }

  return undefined;
};

/* -------------------------------------------------------------------------- */
/* DATE BUCKET                                                                */
/* -------------------------------------------------------------------------- */

const bucketOf = (
  dateString: string
): string => {
  const date = new Date(dateString);

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const differenceDays =
    difference /
    (1000 * 60 * 60 * 24);

  if (
    differenceDays < 1 &&
    date.getDate() === now.getDate()
  ) {
    return "Today";
  }

  if (differenceDays < 2) {
    return "Yesterday";
  }

  if (differenceDays < 7) {
    return "This Week";
  }

  if (differenceDays < 30) {
    return "This Month";
  }

  return "Earlier";
};

const BUCKET_ORDER = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Earlier",
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>([]);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Stores the REAL connection status.
   *
   * This survives refresh because it is populated
   * again from the backend.
   */
  const [
    connectionStatuses,
    setConnectionStatuses,
  ] = useState<
    Record<string, ConnectionStatus>
  >({});

  const [
    respondingConnectionId,
    setRespondingConnectionId,
  ] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /* LOAD NOTIFICATIONS                                                     */
  /* ---------------------------------------------------------------------- */

  const loadPage = useCallback(
    async (
      pageNumber: number,
      replace: boolean
    ) => {
      if (replace) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const result =
          await notificationService.getNotifications(
            pageNumber,
            PAGE_SIZE
          );

        const fetched =
          result.notifications;

        setUnreadCount(
          result.unreadCount
        );

        setHasMore(
          fetched.length === PAGE_SIZE
        );

        setNotifications(
          (previous) =>
            replace
              ? fetched
              : [
                  ...previous,
                  ...fetched,
                ]
        );
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        setError(
          "Could not load notifications. Pull to refresh or try again."
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /* LOAD CONNECTION STATUSES                                               */
  /* ---------------------------------------------------------------------- */

  const loadConnectionStatuses = useCallback(
    async (
      notificationList: AppNotification[]
    ) => {
      const connectionNotifications =
        notificationList.filter(
          (notification) =>
            notification.type ===
            "connection_request"
        );

      if (
        connectionNotifications.length ===
        0
      ) {
        return;
      }

      const statusEntries =
        await Promise.all(
          connectionNotifications.map(
            async (notification) => {
              const connectionId =
                getConnectionId(
                  notification
                );

              const senderId =
                getSenderId(
                  notification
                );

              /*
               * Prefer checking by sender because
               * /connections/status/:userId is
               * already available in your backend.
               */
              if (!senderId) {
                return null;
              }

              try {
                const result =
                  await notificationService.getConnectionStatus(
                    senderId
                  );

                return {
                  connectionId:
                    connectionId ||
                    result.connectionId ||
                    "",
                  status:
                    result.status,
                };
              } catch (error) {
                console.error(
                  "Failed to load connection status:",
                  error
                );

                return null;
              }
            }
          )
        );

      const statuses: Record<
        string,
        ConnectionStatus
      > = {};

      for (
        const entry of statusEntries
      ) {
        if (
          entry &&
          entry.connectionId
        ) {
          statuses[
            entry.connectionId
          ] = entry.status;
        }
      }

      setConnectionStatuses(
        (previous) => ({
          ...previous,
          ...statuses,
        })
      );
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /* INITIAL LOAD                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const loadInitialData =
      async () => {
        try {
          const result =
            await notificationService.getNotifications(
              1,
              PAGE_SIZE
            );

          setNotifications(
            result.notifications
          );

          setUnreadCount(
            result.unreadCount
          );

          setHasMore(
            result.notifications.length ===
              PAGE_SIZE
          );

          setPage(1);

          await loadConnectionStatuses(
            result.notifications
          );
        } catch (error) {
          console.error(
            "Failed to load notifications:",
            error
          );

          setError(
            "Could not load notifications. Pull to refresh or try again."
          );
        } finally {
          setIsLoading(false);
        }
      };

    setIsLoading(true);

    loadInitialData();
  }, [loadConnectionStatuses]);

  /* ---------------------------------------------------------------------- */
  /* REAL-TIME NOTIFICATION                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const unsubscribe =
      onNotificationReceived(
        async () => {
          try {
            const result =
              await notificationService.getNotifications(
                1,
                PAGE_SIZE
              );

            setNotifications(
              result.notifications
            );

            setUnreadCount(
              result.unreadCount
            );

            setHasMore(
              result.notifications.length ===
                PAGE_SIZE
            );

            setPage(1);

            await loadConnectionStatuses(
              result.notifications
            );
          } catch (error) {
            console.error(
              "Failed to refresh notifications:",
              error
            );
          }
        }
      );

    return unsubscribe;
  }, [loadConnectionStatuses]);

  /* ---------------------------------------------------------------------- */
  /* LOAD MORE                                                              */
  /* ---------------------------------------------------------------------- */

  const handleLoadMore = () => {
    if (
      isLoadingMore ||
      !hasMore
    ) {
      return;
    }

    const nextPage =
      page + 1;

    setPage(nextPage);

    loadPage(
      nextPage,
      false
    );
  };

  /* ---------------------------------------------------------------------- */
  /* MARK READ                                                              */
  /* ---------------------------------------------------------------------- */

  const markRead = async (
    notificationId: string
  ) => {
    const currentNotification =
      notifications.find(
        (notification) =>
          notification._id ===
          notificationId
      );

    if (
      !currentNotification ||
      currentNotification.isRead
    ) {
      return;
    }

    setNotifications(
      (previous) =>
        previous.map(
          (notification) =>
            notification._id ===
            notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
        )
    );

    setUnreadCount(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );

    try {
      await notificationService.markAsRead(
        notificationId
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification._id ===
              notificationId
                ? {
                    ...notification,
                    isRead: false,
                  }
                : notification
          )
      );

      setUnreadCount(
        (previous) =>
          previous + 1
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* MARK ALL READ                                                          */
  /* ---------------------------------------------------------------------- */

  const handleMarkAllRead =
    async () => {
      const previousNotifications =
        notifications;

      const previousUnread =
        unreadCount;

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );

      setUnreadCount(0);

      try {
        await notificationService.markAllAsRead();
      } catch {
        setNotifications(
          previousNotifications
        );

        setUnreadCount(
          previousUnread
        );

        setError(
          "Failed to mark all as read."
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /* ACCEPT / IGNORE                                                        */
  /* ---------------------------------------------------------------------- */

  const handleConnectionResponse =
    async (
      notification: AppNotification,
      accept: boolean
    ) => {
      const connectionId =
        getConnectionId(
          notification
        );

      if (!connectionId) {
        toast.error(
          "Connection information is missing."
        );

        return;
      }

      const currentStatus =
        connectionStatuses[
          connectionId
        ];

      /*
       * If the backend status is already resolved,
       * do NOT call the respond endpoint again.
       */
      if (
        currentStatus ===
          "accepted" ||
        currentStatus ===
          "rejected"
      ) {
        return;
      }

      setRespondingConnectionId(
        connectionId
      );

      try {
        const result =
          await postService.respondToConnectionRequest(
            connectionId,
            accept
          );

        /*
         * Backend successfully handled it.
         */
        const newStatus: ConnectionStatus =
          result.status ||
          (accept
            ? "accepted"
            : "rejected");

        setConnectionStatuses(
          (previous) => ({
            ...previous,
            [connectionId]:
              newStatus,
          })
        );

        /*
         * Mark notification as read.
         */
        if (
          !notification.isRead
        ) {
          await markRead(
            notification._id
          );
        }

        toast.success(
          accept
            ? `You're now connected with ${getSenderName(
                notification
              )}`
            : "Request ignored"
        );
      } catch (error: unknown) {
        console.error(
          "Error responding to connection request:",
          error
        );

        /*
         * IMPORTANT:
         *
         * If another request/page already handled
         * the connection, fetch the real backend status.
         *
         * Do NOT show "already handled" automatically.
         */
        try {
          const senderId =
            getSenderId(
              notification
            );

          if (senderId) {
            const statusResult =
              await notificationService.getConnectionStatus(
                senderId
              );

            setConnectionStatuses(
              (previous) => ({
                ...previous,
                [connectionId]:
                  statusResult.status,
              })
            );

            if (
              statusResult.status ===
              "accepted"
            ) {
              toast.success(
                "Connection request was accepted."
              );

              return;
            }

            if (
              statusResult.status ===
              "rejected"
            ) {
              toast.success(
                "Connection request was ignored."
              );

              return;
            }

            if (
              statusResult.status ===
              "pending"
            ) {
              toast.error(
                "Unable to respond to the connection request."
              );

              return;
            }
          }
        } catch (
          statusError
        ) {
          console.error(
            "Failed to verify connection status:",
            statusError
          );
        }

        toast.error(
          "Unable to update the connection request."
        );
      } finally {
        setRespondingConnectionId(
          null
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /* OPEN NOTIFICATION                                                      */
  /* ---------------------------------------------------------------------- */

  const handleOpenNotification =
    async (
      notification: AppNotification
    ) => {
      if (
        !notification.isRead
      ) {
        await markRead(
          notification._id
        );
      }

      /*
       * CONNECTION REQUEST
       */

      if (
        notification.type ===
        "connection_request"
      ) {
        const senderId =
          getSenderId(
            notification
          );

        if (senderId) {
          navigate(
            `/profile/${senderId}`
          );
        } else {
          toast.error(
            "User profile is unavailable."
          );
        }

        return;
      }

      /*
       * CONNECTION ACCEPTED
       */

      if (
        notification.type ===
        "connection_accepted"
      ) {
        const senderId =
          getSenderId(
            notification
          );

        if (senderId) {
          navigate(
            `/profile/${senderId}`
          );
        } else {
          toast.error(
            "User profile is unavailable."
          );
        }

        return;
      }

      /*
       * FOLLOW
       */

      if (
        notification.type ===
        "follow"
      ) {
        const senderId =
          getSenderId(
            notification
          );

        if (senderId) {
          navigate(
            `/profile/${senderId}`
          );
        }

        return;
      }

      /*
       * DIRECT / GROUP MESSAGE
       */

      if (
        notification.type ===
        "message"
      ) {
        const senderId =
          getSenderId(
            notification
          );

        const groupId =
          typeof notification.group ===
          "string"
            ? notification.group
            : notification.group?._id;

        if (groupId) {
          navigate(
            `/chat?groupId=${groupId}`
          );
        } else if (senderId) {
          navigate(
            `/chat?userId=${senderId}`
          );
        } else {
          navigate("/chat");
        }

        return;
      }

      /*
       * POST NOTIFICATIONS
       */

      const postId =
        getPostId(
          notification
        );

      if (!postId) {
        toast.error(
          "This post is no longer available."
        );

        return;
      }

      /*
       * SHARED POST
       */

      if (
        notification.type ===
        "post_share"
      ) {
        const senderId =
          getSenderId(
            notification
          );

        navigate(
          `/post/${postId}/share${
            senderId
              ? `?sharedBy=${senderId}`
              : ""
          }`
        );

        return;
      }

      /*
       * LIKE / COMMENT
       */

      navigate(
        `/post/${postId}`,
        {
          state: {
            scrollToComments:
              notification.type ===
                "comment" ||
              notification.type ===
                "like",
          },
        }
      );
    };

  /* ---------------------------------------------------------------------- */
  /* GROUP NOTIFICATIONS                                                    */
  /* ---------------------------------------------------------------------- */

  const grouped =
    useMemo(() => {
      const map =
        new Map<
          string,
          AppNotification[]
        >();

      for (
        const notification of notifications
      ) {
        const bucket =
          bucketOf(
            notification.createdAt
          );

        if (
          !map.has(bucket)
        ) {
          map.set(
            bucket,
            []
          );
        }

        map
          .get(bucket)!
          .push(
            notification
          );
      }

      return BUCKET_ORDER
        .filter(
          (bucket) =>
            map.has(bucket)
        )
        .map(
          (bucket) => ({
            bucket,
            items:
              map.get(
                bucket
              )!,
          })
        );
    }, [notifications]);

  /* ---------------------------------------------------------------------- */
  /* CONNECTION ACTIONS                                                    */
  /* ---------------------------------------------------------------------- */

  const renderConnectionAction =
    (
      notification: AppNotification
    ) => {
      const connectionId =
        getConnectionId(
          notification
        );

      if (!connectionId) {
        return null;
      }

      const status =
        connectionStatuses[
          connectionId
        ];

      /*
       * ACCEPTED
       */
      if (
        status === "accepted"
      ) {
        return (
          <span className="flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold text-success">
            <Check className="w-4 h-4" />
            Accepted
          </span>
        );
      }

      /*
       * REJECTED / IGNORED
       */
      if (
        status === "rejected"
      ) {
        return (
          <span className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-muted-foreground">
            <X className="w-4 h-4" />
            Ignored
          </span>
        );
      }

      /*
       * CURRENTLY RESPONDING
       */
      const isBusy =
        respondingConnectionId ===
        connectionId;

      /*
       * PENDING
       */
      return (
        <div
          className="flex gap-2 flex-shrink-0"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              handleConnectionResponse(
                notification,
                true
              )
            }
            aria-label="Accept connection request"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isBusy
                ? "..."
                : "Accept"}
            </span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              handleConnectionResponse(
                notification,
                false
              )
            }
            aria-label="Ignore connection request"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-50 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isBusy
                ? "..."
                : "Ignore"}
            </span>
          </button>
        </div>
      );
    };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mx-auto w-full max-w-3xl px-2 pb-10">
      {/* HEADER */}

      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground [font-family:var(--font-display)]">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={
              handleMarkAllRead
            }
            className="rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* LOADING */}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : notifications.length ===
        0 ? (
        <div className="mx-4 mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Heart className="h-7 w-7" />
          </div>

          <p className="text-base font-semibold text-foreground">
            Activity On Your Posts
          </p>

          <p className="max-w-xs px-6 text-center text-sm text-muted-foreground">
            When someone likes,
            comments, follows,
            connects, or shares
            one of your posts,
            it'll show up here.
          </p>
        </div>
      ) : (
        <>
          {grouped.map(
            ({
              bucket,
              items,
            }) => (
              <div
                key={bucket}
                className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <p className="border-b border-border/60 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {bucket}
                </p>

                <div className="divide-y divide-border/60">
                  {items.map(
                    (
                      notification
                    ) => {
                      const thumbnail =
                        getPostThumbnail(
                          notification
                        );

                      const isConnectionRequest =
                        notification.type ===
                        "connection_request";

                      return (
                        <div
                          key={
                            notification._id
                          }
                          onClick={() =>
                            handleOpenNotification(
                              notification
                            )
                          }
                          className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                            !notification.isRead ? "bg-primary/[0.03]" : ""
                          }`}
                        >
                          {/* PROFILE IMAGE */}

                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                getSenderImage(
                                  notification
                                ) ||
                                "https://via.placeholder.com/44"
                              }
                              alt=""
                              className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
                            />

                            <span
                              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${getIconBg(
                                notification.type
                              )}`}
                            >
                              {getIcon(
                                notification.type
                              )}
                            </span>
                          </div>

                          {/* MESSAGE */}

                          <div className="min-w-0 flex-grow">
                            <p className="text-sm text-foreground leading-snug">
                              <span className="font-semibold">
                                {getSenderName(
                                  notification
                                )}
                              </span>{" "}

                              <span>
                                {getDisplayMessage(
                                  notification
                                )}
                              </span>{" "}

                              <span className="text-muted-foreground">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month:
                                      "short",
                                    day:
                                      "numeric",
                                  }
                                )}
                              </span>
                            </p>
                          </div>

                          {/* POST THUMBNAIL */}

                          {thumbnail ? (
                            <img
                              src={
                                thumbnail
                              }
                              alt=""
                              className="h-11 w-11 flex-shrink-0 rounded-lg object-cover ring-1 ring-border"
                            />
                          ) : isConnectionRequest ? (
                            renderConnectionAction(
                              notification
                            )
                          ) : notification.type ===
                            "follow" ? (
                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                const senderId =
                                  getSenderId(
                                    notification
                                  );

                                if (
                                  senderId
                                ) {
                                  navigate(
                                    `/profile/${senderId}`
                                  );
                                }
                              }}
                              className="flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                              View
                            </button>
                          ) : null}

                          {/* UNREAD DOT */}

                          {!notification.isRead &&
                            !thumbnail &&
                            !notification.type.includes(
                              "connection"
                            ) &&
                            notification.type !==
                              "follow" && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}

          {/* LOAD MORE */}

          {hasMore && (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={
                  handleLoadMore
                }
                disabled={
                  isLoadingMore
                }
                className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isLoadingMore
                  ? "Loading..."
                  : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;

