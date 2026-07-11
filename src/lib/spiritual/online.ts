export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function subscribeOnline(
  onChange: (online: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const up = () => onChange(true);
  const down = () => onChange(false);
  window.addEventListener("online", up);
  window.addEventListener("offline", down);
  return () => {
    window.removeEventListener("online", up);
    window.removeEventListener("offline", down);
  };
}
