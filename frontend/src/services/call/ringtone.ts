type AudioContextConstructor = new () => AudioContext;

const RING_INTERVAL_MS = 2200;
const RING_FREQUENCIES = [440, 480];

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

  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.16, startsAt + 0.03);
  gain.gain.setValueAtTime(0.16, startsAt + duration - 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  activeOscillators.add(oscillator);

  oscillator.onended = () => {
    activeOscillators.delete(oscillator);
    oscillator.disconnect();
    gain.disconnect();
  };

  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

function playRingPattern() {
  const context = getAudioContext();
  if (!context) return;

  void context.resume().catch(() => {});

  const start = context.currentTime + 0.03;

  RING_FREQUENCIES.forEach((frequency) => {
    playTone(context, frequency, start, 0.32);
    playTone(context, frequency, start + 0.45, 0.32);
  });
}

export function primeRingtoneAudio() {
  if (audioPrimed || typeof window === "undefined") return;

  audioPrimed = true;

  const resume = () => {
    const context = getAudioContext();
    if (context) {
      void context.resume().catch(() => {});
    }
  };

  const options: AddEventListenerOptions = {
    once: true,
    passive: true,
    capture: true,
  };

  window.addEventListener("pointerdown", resume, options);
  window.addEventListener("touchstart", resume, options);
  window.addEventListener("keydown", resume, { once: true, capture: true });
}

export function startRingtone() {
  if (isRinging) return;

  isRinging = true;

  if (!getAudioContext()) return;

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
      oscillator.stop();
    } catch {
      activeOscillators.delete(oscillator);
    }
  });
}
