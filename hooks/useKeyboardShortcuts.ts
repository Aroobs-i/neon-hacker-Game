import { useEffect } from "react";
import { useGame } from "@/contexts/GameProvider";

export function useKeyboardShortcuts() {
  const { state, pause, resume, startRun, goTo } = useGame();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (state.screen === "playing") pause();
        else if (state.screen === "paused") resume();
        else if (
          state.screen === "settings" ||
          state.screen === "stats" ||
          state.screen === "achievements" ||
          state.screen === "themes" ||
          state.screen === "howto"
        ) {
          goTo(state.run ? "paused" : "menu");
        }
      }
      if ((e.key === " " || e.key === "Enter") && state.screen === "menu") {
        e.preventDefault();
        startRun("endless");
      }
      if (e.key.toLowerCase() === "p" && state.screen === "playing") {
        pause();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.screen, state.run, pause, resume, startRun, goTo]);
}
