import { useEffect } from "react";

import { useAppSelector } from "../../redux/hooks";
import { socket } from "../../socket/socket";
import {
  playNotificationSound,
  stopNotificationSound,
  unlockNotificationSound,
} from "../../services/notification/notificationSound";

interface SoundMessage {
  senderId?: string;
}

export default function NotificationSoundListener() {
  const authUser = useAppSelector((state) => state.auth.user);
  const authToken =
    useAppSelector((state) => state.auth.token) || authUser?.token || "";
  const currentUserId = authUser?._id || authUser?.id || "";

  useEffect(() => {
    const unlock = () => unlockNotificationSound();

    window.addEventListener("pointerdown", unlock, {
      once: true,
      passive: true,
      capture: true,
    });
    window.addEventListener("touchstart", unlock, {
      once: true,
      passive: true,
      capture: true,
    });
    window.addEventListener("keydown", unlock, {
      once: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const handleMessage = (payload?: SoundMessage) => {
      if (!payload?.senderId || payload.senderId === currentUserId) return;
      playNotificationSound();
    };

    socket.on("receive_message", handleMessage);
    socket.on("receive_group_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("receive_group_message", handleMessage);
    };
  }, [authToken, currentUserId]);

  useEffect(
    () => () => {
      stopNotificationSound();
    },
    []
  );

  return null;
}
