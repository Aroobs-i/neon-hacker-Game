"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { gameReducer, GameState } from "@/lib/gameReducer";
import { DEFAULT_SAVE, loadSave, persistSave } from "@/lib/storage";
import { GameMode, Screen, Settings, Stats } from "@/lib/types";
import { audioEngine } from "@/lib/audio";
import { evaluateAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { themesToUnlock } from "@/lib/themes";
import { todayKey } from "@/lib/rng";

interface Ctx {
  state: GameState;
  startRun: (mode: GameMode) => void;
  clickNode: (nodeId: number) => void;
  tick: (deltaMs: number) => void;
  pause: () => void;
  resume: () => void;
  quitToMenu: () => void;
  goTo: (screen: Screen) => void;
  goBack: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  dismissToast: () => void;
  clearFlash: () => void;
  restartRun: () => void;
}

const GameContext = createContext<Ctx | null>(null);

const initialState: GameState = {
  screen: "menu",
  previousScreen: "menu",
  settings: DEFAULT_SAVE.settings,
  stats: DEFAULT_SAVE.stats,
  unlockedThemes: DEFAULT_SAVE.unlockedThemes,
  unlockedAchievements: DEFAULT_SAVE.unlockedAchievements,
  toastQueue: [],
  run: null,
  lastRunSummary: null,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const hydrated = useRef(false);
  const finalizedRun = useRef(false);

  // hydrate from localStorage on mount (client only)
  useEffect(() => {
    const save = loadSave();
    dispatch({
      type: "APPLY_STATS_AND_UNLOCKS",
      stats: save.stats,
      unlockedThemes: save.unlockedThemes,
      unlockedAchievements: save.unlockedAchievements,
      toasts: [],
    });
    dispatch({ type: "UPDATE_SETTINGS", settings: save.settings });
    hydrated.current = true;
  }, []);

  // persist on any relevant state change
  useEffect(() => {
    if (!hydrated.current) return;
    persistSave({
      settings: state.settings,
      stats: state.stats,
      unlockedThemes: state.unlockedThemes as any,
      unlockedAchievements: state.unlockedAchievements,
    });
  }, [state.settings, state.stats, state.unlockedThemes, state.unlockedAchievements]);

  useEffect(() => {
    audioEngine.setSfxEnabled(state.settings.soundOn);
    audioEngine.setMusicEnabled(state.settings.musicOn);
  }, [state.settings.soundOn, state.settings.musicOn]);

  // finalize run stats + achievements when we hit gameover
  useEffect(() => {
    if (state.screen === "gameover" && state.run && !finalizedRun.current) {
      finalizedRun.current = true;
      audioEngine.gameOver();
      const r = state.run;
      const newStats: Stats = {
        ...state.stats,
        gamesPlayed: state.stats.gamesPlayed + 1,
        totalScore: state.stats.totalScore + r.score,
        bestCombo: Math.max(state.stats.bestCombo, r.comboBestThisRun),
        fastestLevelMs:
          r.fastestLevelMsThisRun !== null
            ? state.stats.fastestLevelMs === null
              ? r.fastestLevelMsThisRun
              : Math.min(state.stats.fastestLevelMs, r.fastestLevelMsThisRun)
            : state.stats.fastestLevelMs,
        highestLevel: Math.max(state.stats.highestLevel, r.level),
        highScoreEndless:
          r.mode === "endless" ? Math.max(state.stats.highScoreEndless, r.score) : state.stats.highScoreEndless,
        highScoreDaily:
          r.mode === "daily" && r.dateKey
            ? {
                ...state.stats.highScoreDaily,
                [r.dateKey]: Math.max(state.stats.highScoreDaily[r.dateKey] ?? 0, r.score),
              }
            : state.stats.highScoreDaily,
        totalPlayTimeMs: state.stats.totalPlayTimeMs + r.runClockMs,
      };

      const newlyUnlocked = evaluateAchievements(
        newStats,
        {
          comboThisRun: r.comboBestThisRun,
          lastLevelTimeMs: r.fastestLevelMsThisRun,
          levelReachedThisRun: r.level,
        },
        state.unlockedAchievements
      );
      const newThemes = themesToUnlock(newStats).filter((t) => !state.unlockedThemes.includes(t));

      const toasts = newlyUnlocked.map((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id)!;
        return { id: def.id, title: def.title, description: def.description };
      });

      if (toasts.length > 0) {
        setTimeout(() => audioEngine.achievementUnlock(), 600);
      }

      dispatch({
        type: "APPLY_STATS_AND_UNLOCKS",
        stats: newStats,
        unlockedThemes: [...state.unlockedThemes, ...newThemes],
        unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
        toasts,
      });
    }
    if (state.screen !== "gameover") {
      finalizedRun.current = false;
    }
  }, [state.screen, state.run, state.stats, state.unlockedAchievements, state.unlockedThemes]);

  // mid-run achievement checks (combo x10, speed <10s) fire immediately for satisfying feedback
  const lastCheckedCombo = useRef(0);
  const lastCheckedFastest = useRef<number | null>(null);
  useEffect(() => {
    if (!state.run || state.screen !== "playing") return;
    const r = state.run;
    let changed = false;
    const provisional: Stats = { ...state.stats };
    if (r.comboBestThisRun > lastCheckedCombo.current) {
      lastCheckedCombo.current = r.comboBestThisRun;
      if (r.comboBestThisRun > provisional.bestCombo) {
        provisional.bestCombo = r.comboBestThisRun;
        changed = true;
      }
    }
    if (
      r.fastestLevelMsThisRun !== null &&
      r.fastestLevelMsThisRun !== lastCheckedFastest.current
    ) {
      lastCheckedFastest.current = r.fastestLevelMsThisRun;
      if (provisional.fastestLevelMs === null || r.fastestLevelMsThisRun < provisional.fastestLevelMs) {
        provisional.fastestLevelMs = r.fastestLevelMsThisRun;
        changed = true;
      }
    }
    if (changed) {
      const newlyUnlocked = evaluateAchievements(
        provisional,
        { comboThisRun: r.comboBestThisRun, lastLevelTimeMs: r.fastestLevelMsThisRun, levelReachedThisRun: r.level },
        state.unlockedAchievements
      );
      if (newlyUnlocked.length > 0) {
        const toasts = newlyUnlocked.map((id) => {
          const def = ACHIEVEMENTS.find((a) => a.id === id)!;
          return { id: def.id, title: def.title, description: def.description };
        });
        audioEngine.achievementUnlock();
        dispatch({
          type: "APPLY_STATS_AND_UNLOCKS",
          stats: provisional,
          unlockedThemes: state.unlockedThemes,
          unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
          toasts,
        });
      }
    }
  }, [state.run?.comboBestThisRun, state.run?.fastestLevelMsThisRun]); // eslint-disable-line react-hooks/exhaustive-deps

  // advance to next level shortly after victory pulse plays
  useEffect(() => {
    if (state.run?.levelJustCompleted) {
      audioEngine.levelComplete();
      const t = setTimeout(() => {
        dispatch({ type: "ADVANCE_LEVEL" });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [state.run?.levelJustCompleted]);

  const startRun = useCallback((mode: GameMode) => {
    audioEngine.unlock();
    dispatch({ type: "START_RUN", mode });
  }, []);

  const restartRun = useCallback(() => {
    if (state.run) {
      audioEngine.unlock();
      dispatch({ type: "START_RUN", mode: state.run.mode });
    }
  }, [state.run]);

  const clickNode = useCallback(
    (nodeId: number) => {
      dispatch({ type: "CLICK_NODE", nodeId });
    },
    []
  );

  const tick = useCallback((deltaMs: number) => {
    dispatch({ type: "TICK", deltaMs });
  }, []);

  const pause = useCallback(() => {
    audioEngine.uiClick();
    dispatch({ type: "PAUSE" });
  }, []);
  const resume = useCallback(() => {
    audioEngine.uiClick();
    dispatch({ type: "RESUME" });
  }, []);
  const quitToMenu = useCallback(() => {
    audioEngine.uiClick();
    dispatch({ type: "QUIT_TO_MENU" });
  }, []);
  const goTo = useCallback((screen: Screen) => {
    audioEngine.uiClick();
    dispatch({ type: "GO_TO", screen });
  }, []);
  const goBack = useCallback(() => {
    audioEngine.uiClick();
    dispatch({ type: "GO_TO", screen: state.previousScreen === state.screen ? "menu" : state.previousScreen });
  }, [state.previousScreen, state.screen]);
  const updateSettings = useCallback((s: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", settings: s });
  }, []);
  const dismissToast = useCallback(() => dispatch({ type: "DISMISS_TOAST" }), []);
  const clearFlash = useCallback(() => dispatch({ type: "CLEAR_FLASH" }), []);

  return (
    <GameContext.Provider
      value={{
        state,
        startRun,
        clickNode,
        tick,
        pause,
        resume,
        quitToMenu,
        goTo,
        goBack,
        updateSettings,
        dismissToast,
        clearFlash,
        restartRun,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export { todayKey };
