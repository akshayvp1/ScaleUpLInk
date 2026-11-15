const SOUND_URL = "/notification.wav";
const MIN_PLAY_INTERVAL_MS = 700;

let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
let lastPlayedAt = 0;

function getNotificationAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return null;
  }

  if (!notificationAudio) {
    notificationAudio = new Audio(SOUND_URL);
    notificationAudio.preload = "auto";
    notificationAudio.volume = 0.75;
  }

  return notificationAudio;
}

export function unlockNotificationSound() {
  if (audioUnlocked) return;

  const audio = getNotificationAudio();
  if (!audio) return;

  try {
    audio.muted = true;
    const playPromise = audio.play();

    if (!playPromise) {
      audio.muted = false;
      audioUnlocked = true;
      return;
    }

    playPromise
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audioUnlocked = true;
      })
      .catch(() => {
        audio.muted = false;
      });
  } catch {
    audio.muted = false;
  }
}

export function playNotificationSound() {
  const audio = getNotificationAudio();
  if (!audio) return;

  const now = Date.now();
  if (now - lastPlayedAt < MIN_PLAY_INTERVAL_MS) return;

  lastPlayedAt = now;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;

    const playPromise = audio.play();
    if (playPromise) {
      void playPromise.catch(() => {});
    }
  } catch {
    // Browser autoplay restrictions can block this until the first gesture.
  }
}

export function stopNotificationSound() {
  if (!notificationAudio) return;

  try {
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
  } catch {
    // Ignore teardown errors when the browser has already released the media.
  }
}
