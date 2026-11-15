type Listener = () => void;

const listeners = new Set<Listener>();

export function onNotificationReceived(
  listener: Listener
): () => void {
  listeners.add(listener);

  return () =>
    listeners.delete(listener);
}

export function emitNotificationReceived(): void {
  listeners.forEach(
    (listener) => listener()
  );
}