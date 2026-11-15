import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeOscillator {
  type = "sine";
  frequency = { setValueAtTime: vi.fn() };
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeGain {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  state = "running";
  currentTime = 0;
  destination = {};
  oscillators: FakeOscillator[] = [];
  resume = vi.fn(async () => {});

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGain();
  }
}

describe("incoming call ringtone", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    FakeAudioContext.instances = [];
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rings repeatedly without stacking duplicate ring patterns", async () => {
    const { startRingtone, stopRingtone } = await import(
      "../../src/services/call/ringtone"
    );

    startRingtone();
    const context = FakeAudioContext.instances[0];

    expect(context.oscillators).toHaveLength(4);

    startRingtone();
    expect(context.oscillators).toHaveLength(4);

    vi.advanceTimersByTime(2200);
    expect(context.oscillators).toHaveLength(8);

    const immediateStopsBefore = context.oscillators.filter((oscillator) =>
      oscillator.stop.mock.calls.some((call) => call.length === 0)
    ).length;

    stopRingtone();

    const immediateStopsAfter = context.oscillators.filter((oscillator) =>
      oscillator.stop.mock.calls.some((call) => call.length === 0)
    ).length;

    expect(immediateStopsBefore).toBe(0);
    expect(immediateStopsAfter).toBeGreaterThanOrEqual(4);

    vi.advanceTimersByTime(5000);

    expect(context.oscillators).toHaveLength(8);
    expect(
      context.oscillators.filter((oscillator) =>
        oscillator.stop.mock.calls.some((call) => call.length === 0)
      ).length
    ).toBe(immediateStopsAfter);
  });

  it("resumes a suspended audio context on the first user gesture", async () => {
    const { primeRingtoneAudio } = await import(
      "../../src/services/call/ringtone"
    );

    primeRingtoneAudio();

    window.dispatchEvent(new Event("pointerdown"));

    const context = FakeAudioContext.instances[0];
    expect(context.resume).toHaveBeenCalled();
  });
});
