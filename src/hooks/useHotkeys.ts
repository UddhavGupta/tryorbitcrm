import { useEffect, useRef } from "react";

type Handler = (e: KeyboardEvent) => void;

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
};

/**
 * Register a keymap of single-key and 2-key chord shortcuts.
 * - "n", "r", "/", "?" — single key
 * - "g p", "g r"       — sequence (press g, then within 1.2s the next key)
 * Skips when the user is typing in an input/textarea/contenteditable
 * (except for "?" with shift, which always fires the help overlay).
 */
export function useHotkeys(map: Record<string, Handler>) {
  const seqRef = useRef<{ key: string; ts: number } | null>(null);
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Always allow "?" help even from inputs? No — keep predictable: only outside inputs.
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // Sequence completion
      if (seqRef.current && Date.now() - seqRef.current.ts < 1200) {
        const combo = `${seqRef.current.key} ${key.toLowerCase()}`;
        seqRef.current = null;
        const h = mapRef.current[combo];
        if (h) {
          e.preventDefault();
          h(e);
          return;
        }
      } else {
        seqRef.current = null;
      }

      // Start sequence on "g"
      if (key.toLowerCase() === "g" && !e.shiftKey) {
        seqRef.current = { key: "g", ts: Date.now() };
        return;
      }

      const single = e.shiftKey && key === "?" ? "?" : key.toLowerCase();
      const h = mapRef.current[single];
      if (h) {
        e.preventDefault();
        h(e);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
