
// ============================================================
// Firebase SDK
// ============================================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);


// ============================================================
// Firebase Configuration
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBxQgpERGsKIzbwr6bQaQoq0ypL89zasXA",
  authDomain: "scaleuplink-e8146.firebaseapp.com",
  projectId: "scaleuplink-e8146",
  storageBucket: "scaleuplink-e8146.firebasestorage.app",
  messagingSenderId: "519916670061",
  appId: "1:519916670061:web:cb7d7b6be4e0a555460364",
  measurementId: "G-MFXFN2PB8P"
};


// ============================================================
// Initialize Firebase
// ============================================================

firebase.initializeApp(
  firebaseConfig
);

const messaging =
  firebase.messaging();


// ============================================================
// BACKGROUND NOTIFICATION
// ============================================================

messaging.onBackgroundMessage(
  (payload) => {

    console.log(
      "[firebase-messaging-sw.js] Background message:",
      payload
    );

    const notification =
      payload.notification || {};

    const data =
      payload.data || {};

    const title =
      notification.title ||
      "New notification";

    const body =
      notification.body ||
      "";

    /*
     * Create a unique notification tag.
     *
     * Previously:
     *
     * tag: data.type
     *
     * This could cause multiple notifications
     * of the same type to replace each other.
     */
    const notificationTag =
      data.connectionId ||
      data.postId ||
      `${data.type || "notification"}-${Date.now()}`;

    self.registration.showNotification(
      title,
      {
        body,

        icon:
          "/icon-192.png",

        badge:
          "/icon-192.png",

        data,

        tag:
          notificationTag,

        requireInteraction:
          false
      }
    );
  }
);


// ============================================================
// NOTIFICATION CLICK
// ============================================================

self.addEventListener(
  "notificationclick",
  (event) => {

    console.log(
      "[firebase-messaging-sw.js] Notification clicked:",
      event.notification.data
    );

    event.notification.close();

    const data =
      event.notification.data || {};

    let url = "/";

    // ========================================================
    // CONNECTION REQUEST
    // ========================================================

    if (
      data.type ===
      "connection_request"
    ) {

      const userId =
        data.userId ||
        data.senderId;

      if (userId) {
        url =
          `/profile/${userId}`;
      }
    }

    // ========================================================
    // CONNECTION ACCEPTED
    // ========================================================

    else if (
      data.type ===
      "connection_accepted"
    ) {

      const userId =
        data.userId ||
        data.senderId;

      if (userId) {
        url =
          `/profile/${userId}`;
      }
    }

    // ========================================================
    // FOLLOW
    // ========================================================

    else if (
      data.type ===
      "follow"
    ) {

      const userId =
        data.userId ||
        data.senderId;

      if (userId) {
        url =
          `/profile/${userId}`;
      }
    }

    // ========================================================
    // LIKE
    // ========================================================

    else if (
      data.type ===
      "like"
    ) {

      if (data.postId) {
        url =
          `/post/${data.postId}`;
      }
    }

    // ========================================================
    // COMMENT
    // ========================================================

    else if (
      data.type ===
      "comment"
    ) {

      if (data.postId) {
        url =
          `/post/${data.postId}`;
      }
    }

    // ========================================================
    // SHARE
    // ========================================================

    else if (
      data.type ===
      "post_share"
    ) {

      if (data.postId) {
        url =
          `/post/${data.postId}`;
      }
    }

    // ========================================================
    // OPEN APPLICATION
    // ========================================================

    event.waitUntil(

      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })

        .then(
          (clientList) => {

            /*
             * Try to reuse an existing tab.
             */
            for (
              const client
              of clientList
            ) {

              if (
                "navigate" in client &&
                "focus" in client
              ) {

                return client
                  .navigate(url)
                  .then(
                    () =>
                      client.focus()
                  );
              }
            }

            /*
             * Otherwise open a new tab.
             */
            if (
              clients.openWindow
            ) {

              return clients.openWindow(
                url
              );
            }

            return undefined;
          }
        )
    );
  }
);

