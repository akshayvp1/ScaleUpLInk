// ============================================================
// Firebase
// ============================================================

import { initializeApp } from "firebase/app";

import {
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";

import notificationService from "./notificationService";

import {
  emitNotificationReceived,
} from "./notificationEvents";

// IMPORTANT:
// Change this import path if your NotificationToastContainer
// is located somewhere else.
import {
  pushToast,
} from "../../components/basics/NotificationToastContainer";


// ============================================================
// Firebase Configuration
// ============================================================

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID,

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID,
};


// ============================================================
// Initialize Firebase
// ============================================================

const app =
  initializeApp(firebaseConfig);

const messaging =
  getMessaging(app);


// ============================================================
// NOTIFICATION SOUND
// ============================================================

let notificationAudio: HTMLAudioElement | null =
  null;

let audioUnlocked = false;

let audioUnlockListenersRegistered =
  false;


// ============================================================
// CREATE AUDIO
// ============================================================

function createNotificationAudio() {
  if (notificationAudio) {
    return notificationAudio;
  }

  notificationAudio =
    new Audio("/notification.wav");

  notificationAudio.preload =
    "auto";

  notificationAudio.volume =
    1.0;

  return notificationAudio;
}


// ============================================================
// UNLOCK AUDIO
// ============================================================
//
// Browsers such as Chrome do not allow a website to
// automatically play audio until the user has interacted
// with the page.
//
// We unlock the audio on the first click/touch/key press.
//

function unlockNotificationAudio() {
  if (audioUnlocked) {
    return;
  }

  const audio =
    createNotificationAudio();

  try {
    audio.muted = true;

    const playPromise =
      audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          audio.pause();

          audio.currentTime = 0;

          audio.muted = false;

          audioUnlocked = true;

          console.log(
            "Notification sound unlocked"
          );

          removeAudioUnlockListeners();
        })
        .catch((error) => {
          console.warn(
            "Could not unlock notification audio:",
            error
          );

          audio.muted = false;
        });
    }
  } catch (error) {
    console.warn(
      "Notification audio unlock failed:",
      error
    );
  }
}


// ============================================================
// REMOVE UNLOCK LISTENERS
// ============================================================

function removeAudioUnlockListeners() {
  if (!audioUnlockListenersRegistered) {
    return;
  }

  window.removeEventListener(
    "click",
    unlockNotificationAudio
  );

  window.removeEventListener(
    "touchstart",
    unlockNotificationAudio
  );

  window.removeEventListener(
    "keydown",
    unlockNotificationAudio
  );

  audioUnlockListenersRegistered =
    false;
}


// ============================================================
// REGISTER AUDIO UNLOCK LISTENERS
// ============================================================

function registerAudioUnlockListeners() {
  if (
    audioUnlockListenersRegistered
  ) {
    return;
  }

  window.addEventListener(
    "click",
    unlockNotificationAudio,
    {
      once: false,
      passive: true,
    }
  );

  window.addEventListener(
    "touchstart",
    unlockNotificationAudio,
    {
      once: false,
      passive: true,
    }
  );

  window.addEventListener(
    "keydown",
    unlockNotificationAudio,
    {
      once: false,
      passive: true,
    }
  );

  audioUnlockListenersRegistered =
    true;
}


// ============================================================
// PLAY NOTIFICATION SOUND
// ============================================================

async function playNotificationSound() {
  const audio =
    createNotificationAudio();

  try {
    /*
     * If the user has already interacted with
     * the application, audio should already be unlocked.
     */
    if (!audioUnlocked) {
      console.warn(
        "Notification sound is locked by browser autoplay policy."
      );

      return;
    }

    /*
     * Stop any currently playing notification sound.
     *
     * This prevents multiple overlapping sounds.
     */
    audio.pause();

    audio.currentTime = 0;

    audio.volume = 1.0;

    await audio.play();

    console.log(
      "Notification sound played"
    );
  } catch (error) {
    console.error(
      "Notification sound could not be played:",
      error
    );
  }
}


// ============================================================
// GET FOREGROUND DATA
// ============================================================

function getNotificationData(
  payload: MessagePayload
): Record<string, string> {
  return (
    (payload.data || {}) as Record<
      string,
      string
    >
  );
}


// ============================================================
// SETUP PUSH NOTIFICATIONS
// ============================================================

export async function setupPushNotifications(
  onForegroundNotification?: (
    title: string,
    body: string,
    data?: Record<string, string>
  ) => void
) {
  try {
    console.log(
      "1. Preparing notification audio..."
    );

    /*
     * Preload the WAV file.
     *
     * The file must exist at:
     *
     * public/notification.wav
     *
     * Vite will serve it as:
     *
     * /notification.wav
     */
    createNotificationAudio();

    /*
     * Listen for the first user interaction.
     *
     * This is required by browser autoplay policies.
     */
    registerAudioUnlockListeners();

    console.log(
      "2. Requesting notification permission..."
    );

    const permission =
      await Notification.requestPermission();

    console.log(
      "3. Permission result:",
      permission
    );

    if (permission !== "granted") {
      console.warn(
        "Notification permission not granted"
      );

      return;
    }


    // ========================================================
    // SERVICE WORKER
    // ========================================================

    console.log(
      "4. Registering Firebase service worker..."
    );

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "5. Service worker registered:",
      registration
    );


    // ========================================================
    // GET FCM TOKEN
    // ========================================================

    const token =
      await getToken(
        messaging,
        {
          vapidKey:
            import.meta.env
              .VITE_FIREBASE_VAPID_KEY,

          serviceWorkerRegistration:
            registration,
        }
      );

    console.log(
      "6. Firebase token:",
      token
    );

    if (!token) {
      console.warn(
        "No Firebase token returned. Check VAPID key."
      );

      return;
    }


    // ========================================================
    // REGISTER DEVICE
    // ========================================================

    console.log(
      "7. Registering device with backend..."
    );

    await notificationService.registerDevice(
      token,
      "web"
    );

    console.log(
      "8. Device registration completed"
    );


    // ========================================================
    // FOREGROUND MESSAGE
    // ========================================================

    onMessage(
      messaging,
      async (payload) => {
        console.log(
          "===================================="
        );

        console.log(
          "FOREGROUND FCM NOTIFICATION"
        );

        console.log(
          "Payload:",
          payload
        );

        console.log(
          "===================================="
        );


        // ------------------------------------------------------
        // DATA
        // ------------------------------------------------------

        const data =
          getNotificationData(
            payload
          );


        const title =
          payload.notification?.title ||
          "New notification";

        const body =
          payload.notification?.body ||
          "";


        // ------------------------------------------------------
        // PLAY SOUND
        // ------------------------------------------------------

        await playNotificationSound();


        // ------------------------------------------------------
        // SHOW TOAST
        // ------------------------------------------------------

        /*
         * This creates exactly one toast for the FCM event.
         */
        pushToast(
          title,
          body,
          data
        );


        // ------------------------------------------------------
        // REFRESH NOTIFICATION PAGE / BELL
        // ------------------------------------------------------

        /*
         * This tells:
         *
         * NotificationBell
         * NotificationsPage
         *
         * to reload their notification list.
         */
        emitNotificationReceived();


        // ------------------------------------------------------
        // OPTIONAL CALLBACK
        // ------------------------------------------------------

        onForegroundNotification?.(
          title,
          body,
          data
        );
      }
    );


    console.log(
      "9. Firebase foreground listener registered"
    );

  } catch (error) {
    console.error(
      "Push notification setup failed:",
      error
    );
  }
}


// ============================================================
// TEARDOWN PUSH NOTIFICATIONS
// ============================================================

export async function teardownPushNotifications() {
  try {
    const registration =
      await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
      );

    if (!registration) {
      return;
    }


    const token =
      await getToken(
        messaging,
        {
          vapidKey:
            import.meta.env
              .VITE_FIREBASE_VAPID_KEY,

          serviceWorkerRegistration:
            registration,
        }
      ).catch(
        () => null
      );


    if (token) {
      await notificationService.unregisterDevice(
        token
      );
    }

  } catch (error) {
    console.error(
      "Push notification teardown failed:",
      error
    );
  }
}