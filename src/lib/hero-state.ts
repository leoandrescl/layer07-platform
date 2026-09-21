type Listener = (active: boolean) => void;

const listeners = new Set<Listener>();
let active = false;

export function setHeroActive(next: boolean) {
  if (active === next) return;
  active = next;
  for (const listener of listeners) listener(active);
}

export function isHeroActive() {
  return active;
}

export function subscribeHeroActive(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
