import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import NotificationToast, {
  ToastNotification,
} from "./NotificationToast";

// ---------------------------------------------------------
// Module-level toast trigger
// ---------------------------------------------------------

let pushToastRef:
  | ((title: string, body: string) => void)
  | null = null;

export function pushToast(
  title: string,
  body: string
) {
  pushToastRef?.(
    title,
    body
  );
}

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------

const NotificationToastContainer: React.FC =
  () => {
    const navigate = useNavigate();

    const [toasts, setToasts] =
      useState<ToastNotification[]>([]);

    const addToast = useCallback(
      (
        title: string,
        body: string
      ) => {
        const id =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

        setToasts((prev) => {
          // Prevent exact duplicate toast
          const duplicate =
            prev.some(
              (toast) =>
                toast.title === title &&
                toast.body === body
            );

          if (duplicate) {
            return prev;
          }

          return [
            ...prev,
            {
              id,
              title,
              body,
            },
          ];
        });
      },
      []
    );

    const removeToast =
      useCallback(
        (id: string) => {
          setToasts((prev) =>
            prev.filter(
              (toast) =>
                toast.id !== id
            )
          );
        },
        []
      );

    const handleToastClick =
      useCallback(
        (id: string) => {
          removeToast(id);

          navigate(
            "/notification"
          );
        },
        [
          navigate,
          removeToast,
        ]
      );

    useEffect(() => {
      pushToastRef = addToast;

      return () => {
        pushToastRef = null;
      };
    }, [addToast]);

    return (
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(
          (notification) => (
            <NotificationToast
              key={
                notification.id
              }
              notification={
                notification
              }
              onDismiss={
                removeToast
              }
              onClick={
                handleToastClick
              }
            />
          )
        )}
      </div>
    );
  };

export default NotificationToastContainer;