
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { Bell } from "lucide-react";

import { toast } from "react-hot-toast";

import notificationService, {
  AppNotification,
} from "../../services/notification/notificationService";

import {
  onNotificationReceived,
} from "../../services/notification/notificationEvents";


const NotificationBell: React.FC = () => {

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    AppNotification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);


  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications =
    useCallback(
      async () => {
        setIsLoading(true);

        try {
          const {
            notifications: fetched,
            unreadCount: count,
          } =
            await notificationService.getNotifications();

          setNotifications(
            fetched
          );

          setUnreadCount(
            count
          );

        } catch (error) {

          console.error(
            "Failed to load notifications:",
            error
          );

        } finally {

          setIsLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // REAL-TIME REFRESH
  // ==========================================================

  useEffect(() => {

    const unsubscribe =
      onNotificationReceived(
        () => {
          loadNotifications();
        }
      );

    return unsubscribe;

  }, [
    loadNotifications,
  ]);


  // ==========================================================
  // INITIAL LOAD + POLLING
  // ==========================================================

  useEffect(() => {

    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        30000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [
    loadNotifications,
  ]);


  // ==========================================================
  // CLICK OUTSIDE
  // ==========================================================

  useEffect(() => {

    const handleClickOutside =
      (event: MouseEvent) => {

        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as Node
          )
        ) {
          setIsOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);


  // ==========================================================
  // TOGGLE
  // ==========================================================

  const handleToggle =
    () => {

      setIsOpen(
        (previous) =>
          !previous
      );

      if (!isOpen) {
        loadNotifications();
      }
    };


  // ==========================================================
  // MARK READ
  // ==========================================================

  const handleMarkRead =
    async (
      notificationId: string
    ) => {

      try {

        const notification =
          notifications.find(
            (item) =>
              item._id ===
              notificationId
          );

        if (
          !notification ||
          notification.isRead
        ) {
          return;
        }

        await notificationService.markAsRead(
          notificationId
        );

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                notificationId
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
            )
        );

        setUnreadCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );

      } catch (error) {

        console.error(
          "Error marking notification read:",
          error
        );
      }
    };


  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  const handleMarkAllRead =
    async () => {

      try {

        await notificationService.markAllAsRead();

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

      } catch (error) {

        console.error(
          "Error marking all notifications read:",
          error
        );

        toast.error(
          "Failed to update notifications"
        );
      }
    };


  // ==========================================================
  // HELPERS
  // ==========================================================

  const getSenderName =
    (
      notification: AppNotification
    ) =>
      typeof notification.sender ===
      "object"
        ? notification.sender.name
        : "Someone";


  const getSenderImage =
    (
      notification: AppNotification
    ) =>
      typeof notification.sender ===
      "object"
        ? notification.sender.profileImage
        : undefined;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="relative"
      ref={containerRef}
    >

      <button
        type="button"
        onClick={
          handleToggle
        }
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >

        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white ring-2 ring-background">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}

      </button>


      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-card shadow-float">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">

            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllRead
                }
                className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Mark all read
              </button>
            )}

          </div>


          {/* BODY */}

          <div className="max-h-96 divide-y divide-border/60 overflow-y-auto">

            {isLoading &&
            notifications.length === 0 ? (

              <div className="flex justify-center py-10">

                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />

              </div>

            ) : notifications.length ===
              0 ? (

              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">You're all caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">No notifications yet.</p>
              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <button
                    type="button"
                    key={
                      notification._id
                    }
                    onClick={() => {

                      if (
                        !notification.isRead
                      ) {
                        handleMarkRead(
                          notification._id
                        );
                      }

                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                      !notification.isRead
                        ? "bg-primary/[0.04]"
                        : ""
                    }`}
                  >

                    <img
                      src={
                        getSenderImage(
                          notification
                        ) ||
                        "https://via.placeholder.com/36"
                      }
                      alt={
                        getSenderName(
                          notification
                        )
                      }
                      className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-1 ring-border"
                    />

                    <div className="min-w-0 flex-grow">

                      <p className="text-sm text-foreground">

                        <span className="font-semibold">
                          {getSenderName(
                            notification
                          )}
                        </span>{" "}

                        <span className="text-muted-foreground">
                          {notification.message}
                        </span>

                      </p>

                      <p className="text-xs text-muted-foreground mt-0.5">

                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}

                      </p>

                    </div>


                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}

                  </button>

                )
              )

            )}

          </div>

        </div>
      )}

    </div>
  );
};


export default NotificationBell;

