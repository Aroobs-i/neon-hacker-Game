import { useEffect, useRef } from "react";

/**
 * Runs a requestAnimationFrame loop and calls back with the delta time
 * in milliseconds each frame. Pauses automatically when `active` is false
 * so we don't burn cycles (or advance the timer) while paused/menu'd.
 */
export function useRafLoop(active: boolean, callback: (deltaMs: number) => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      lastRef.current = null;
      return;
    }
    const loop = (t: number) => {
      if (lastRef.current !== null) {
        const delta = Math.min(64, t - lastRef.current); // clamp to avoid huge jumps on tab-back
        cbRef.current(delta);
      }
      lastRef.current = t;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [active]);
}
