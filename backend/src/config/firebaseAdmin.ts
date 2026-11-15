
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    `Firebase credentials missing: ${
      !projectId ? "FIREBASE_PROJECT_ID " : ""
    }${!clientEmail ? "FIREBASE_CLIENT_EMAIL " : ""}${
      !privateKey ? "FIREBASE_PRIVATE_KEY" : ""
    }`
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const messaging = getMessaging();
