import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationToast, {
  ToastNotification,
} from "./NotificationToast";

let pushToastRef:
  | ((
      title: string,
      body: string,
      data?: Record<string, string>
    ) => void)
  | null = null;

export function pushToast(
  title: string,
  body: string,
  data?: Record<string, string>
) {
  pushToastRef?.(title, body, data);
}

function getToastTarget(data?: Record<string, string>) {
  if (!data) return { pathname: "/notification" };

  const senderId = data.senderId || data.userId;
  const postId = data.postId;

  if (data.type === "message") {
    if (data.groupId) {
      return {
        pathname: `/chat?groupId=${encodeURIComponent(data.groupId)}`,
      };
    }
    if (senderId) {
      return {
        pathname: `/chat?userId=${encodeURIComponent(senderId)}`,
      };
    }
    return { pathname: "/chat" };
  }

  if (
    data.type === "follow" ||
    data.type === "connection_request" ||
    data.type === "connection_accepted"
  ) {
    return senderId
      ? { pathname: `/profile/${senderId}` }
      : { pathname: "/notification" };
  }

  if (!postId) return { pathname: "/notification" };

  if (data.type === "post_share") {
    const query = senderId
      ? `?sharedBy=${encodeURIComponent(senderId)}`
      : "";
    return { pathname: `/post/${postId}/share${query}` };
  }

  return {
    pathname: `/post/${postId}`,
    state: { scrollToComments: true },
  };
}

const NotificationToastContainer: React.FC = () => {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (
      title: string,
      body: string,
      data?: Record<string, string>
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setToasts((previous) => {
        const duplicate = previous.some(
          (toast) => toast.title === title && toast.body === body
        );

        if (duplicate) return previous;

        return [...previous, { id, title, body, data }];
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const handleToastClick = useCallback(
    (toast: ToastNotification) => {
      removeToast(toast.id);

      const target = getToastTarget(toast.data);
      navigate(target.pathname, { state: target.state });
    },
    [navigate, removeToast]
  );

  useEffect(() => {
    pushToastRef = addToast;

    return () => {
      pushToastRef = null;
    };
  }, [addToast]);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onDismiss={removeToast}
            onClick={() => handleToastClick(notification)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationToastContainer;
