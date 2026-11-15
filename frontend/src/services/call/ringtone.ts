type AudioContextConstructor = new () => AudioContext;

const RING_INTERVAL_MS = 2200;

// A short, musical chime (E5, G5, B5, G5). Four notes keep the ringtone
// pleasant without overlapping the next ring cycle or stacking oscillators.
const RING_MELODY: Array<{ frequency: number; offset: number; duration: number }> =
  [
    { frequency: 659.25, offset: 0, duration: 0.18 },
    { frequency: 783.99, offset: 0.2, duration: 0.18 },
    { frequency: 987.77, offset: 0.4, duration: 0.3 },
    { frequency: 783.99, offset: 0.76, duration: 0.2 },
  ];

let audioContext: AudioContext | null = null;
let ringTimer: number | null = null;
let isRinging = false;
let audioPrimed = false;
const activeOscillators = new Set<OscillatorNode>();

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;

  const legacyWindow = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };

  return window.AudioContext ?? legacyWindow.webkitAudioContext ?? null;
}

function getAudioContext(): AudioContext | null {
  if (audioContext && audioContext.state !== "closed") {
    return audioContext;
  }

  const AudioContextClass = getAudioContextConstructor();
  if (!AudioContextClass) return null;

  try {
    audioContext = new AudioContextClass();
  } catch {
    audioContext = null;
  }

  return audioContext;
}

function resumeAudioContext(context: AudioContext) {
  try {
    const result = context.resume();

    if (result && typeof result.catch === "function") {
      void result.catch(() => {});
    }
  } catch {
    // Some browsers throw if the context has already been closed.
  }
}

function playTone(
  context: AudioContext,
  frequency: number,
  startsAt: number,
  duration: number
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startsAt);

  // Soft attack and release keep the melody from sounding harsh on phone
  // speakers while still being loud enough to notice.
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.14, startsAt + 0.03);
  gain.gain.setValueAtTime(0.14, startsAt + duration - 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  activeOscillators.add(oscillator);

  oscillator.onended = () => {
    activeOscillators.delete(oscillator);
    try {
      oscillator.disconnect();
      gain.disconnect();
    } catch {
      // The browser may have already detached the nodes.
    }
  };

  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

function playRingPattern() {
  const context = getAudioContext();
  if (!context) return;

  resumeAudioContext(context);

  const start = context.currentTime + 0.03;

  RING_MELODY.forEach((note) => {
    playTone(
      context,
      note.frequency,
      start + note.offset,
      note.duration
    );
  });
}

export function primeRingtoneAudio() {
  if (audioPrimed || typeof window === "undefined") return;

  audioPrimed = true;

  const resume = () => {
    const context = getAudioContext();
    if (context) {
      resumeAudioContext(context);
    }
  };

  const options: AddEventListenerOptions = {
    once: true,
    passive: true,
    capture: true,
  };

  window.addEventListener("pointerdown", resume, options);
  window.addEventListener("mousedown", resume, options);
  window.addEventListener("touchstart", resume, options);
  window.addEventListener("keydown", resume, { once: true, capture: true });
  window.addEventListener("focus", resume);
  document.addEventListener("visibilitychange", resume);
}

export function startRingtone() {
  if (isRinging) return;

  const context = getAudioContext();
  if (!context) return;

  isRinging = true;
  resumeAudioContext(context);

  playRingPattern();
  ringTimer = window.setInterval(playRingPattern, RING_INTERVAL_MS);
}

export function stopRingtone() {
  isRinging = false;

  if (ringTimer !== null) {
    window.clearInterval(ringTimer);
    ringTimer = null;
  }

  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.onended = null;
      oscillator.stop();
      oscillator.disconnect();
    } catch {
      // Ignore nodes that have already finished.
    }
  });

  activeOscillators.clear();
}
