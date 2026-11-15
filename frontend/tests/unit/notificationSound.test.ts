import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeAudio {
  static instances: FakeAudio[] = [];

  src: string;
  preload = "";
  volume = 1;
  muted = false;
  currentTime = 0;
  pause = vi.fn();
  play = vi.fn(async () => {});

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

describe("notification sound", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("plays once and throttles rapid notifications", async () => {
    const { playNotificationSound } = await import(
      "../../src/services/notification/notificationSound"
    );

    playNotificationSound();
    const audio = FakeAudio.instances[0];

    expect(audio.src).toBe("/notification.wav");
    expect(audio.play).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    playNotificationSound();

    expect(audio.play).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(401);
    playNotificationSound();

    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it("stops and rewinds the shared audio element", async () => {
    const { playNotificationSound, stopNotificationSound } = await import(
      "../../src/services/notification/notificationSound"
    );

    playNotificationSound();
    const audio = FakeAudio.instances[0];

    audio.currentTime = 1;
    stopNotificationSound();

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });
});
