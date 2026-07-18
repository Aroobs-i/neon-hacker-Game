import { GameMode, GameNode, LevelData, Screen, Settings, Stats } from "./types";
import { generateLevel } from "./levelGenerator";
import { dailySeed, todayKey } from "./rng";

export const COMBO_WINDOW_MS = 3200;
export const BONUS_TIME_MS = 4500;
export const FIREWALL_PENALTY_MS = 3000;
export const MISTAKE_PENALTY_MS = 1200;
export const BASE_NODE_SCORE = 100;

export interface RunState {
  mode: GameMode;
  level: number;
  seed: number;
  dateKey: string | null;
  levelData: LevelData;
  timeRemainingMs: number;
  timeLimitMs: number;
  score: number;
  combo: number;
  comboBestThisRun: number;
  nextSeq: number;
  sequenceTotal: number;
  lastActionAt: number; // ms clock local to run, for combo decay
  runClockMs: number; // elapsed ms since run start
  levelClockMs: number; // elapsed ms since current level start
  fastestLevelMsThisRun: number | null;
  flashNodeId: number | null; // node to flash red/gold briefly
  flashKind: "wrong" | "firewall" | "bonus" | "correct" | null;
  shakeSeed: number; // increment to trigger a screen shake in the canvas
  levelJustCompleted: boolean; // true for one tick to show victory pulse
  gameOverReason: "time" | null;
}

export interface GameState {
  screen: Screen;
  previousScreen: Screen;
  settings: Settings;
  stats: Stats;
  unlockedThemes: string[];
  unlockedAchievements: string[];
  toastQueue: { id: string; title: string; description: string }[];
  run: RunState | null;
  lastRunSummary: {
    mode: GameMode;
    score: number;
    level: number;
    isNewHighScore: boolean;
  } | null;
}

export type GameAction =
  | { type: "GO_TO"; screen: Screen }
  | { type: "START_RUN"; mode: GameMode }
  | { type: "TICK"; deltaMs: number }
  | { type: "CLICK_NODE"; nodeId: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "QUIT_TO_MENU" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "DISMISS_TOAST" }
  | { type: "APPLY_STATS_AND_UNLOCKS"; stats: Stats; unlockedThemes: string[]; unlockedAchievements: string[]; toasts: { id: string; title: string; description: string }[] }
  | { type: "CLEAR_FLASH" }
  | { type: "ADVANCE_LEVEL" }
  | { type: "GAME_OVER" };

function freshRun(mode: GameMode): RunState {
  const dateKey = mode === "daily" ? todayKey() : null;
  const seed = mode === "daily" ? dailySeed(dateKey!) : Math.floor(Math.random() * 2 ** 31);
  const levelData = generateLevel(1, seed);
  return {
    mode,
    level: 1,
    seed,
    dateKey,
    levelData,
    timeRemainingMs: levelData.timeLimit * 1000,
    timeLimitMs: levelData.timeLimit * 1000,
    score: 0,
    combo: 0,
    comboBestThisRun: 0,
    nextSeq: 0,
    sequenceTotal: levelData.nodes.filter((n) => n.kind === "sequence").length,
    lastActionAt: 0,
    runClockMs: 0,
    levelClockMs: 0,
    fastestLevelMsThisRun: null,
    flashNodeId: null,
    flashKind: null,
    shakeSeed: 0,
    levelJustCompleted: false,
    gameOverReason: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "GO_TO":
      return { ...state, previousScreen: state.screen, screen: action.screen };

    case "START_RUN":
      return { ...state, run: freshRun(action.mode), screen: "playing" };

    case "PAUSE":
      if (state.screen !== "playing") return state;
      return { ...state, previousScreen: state.screen, screen: "paused" };

    case "RESUME":
      if (state.screen !== "paused") return state;
      return { ...state, screen: "playing" };

    case "QUIT_TO_MENU":
      return { ...state, run: null, screen: "menu" };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case "DISMISS_TOAST":
      return { ...state, toastQueue: state.toastQueue.slice(1) };

    case "APPLY_STATS_AND_UNLOCKS":
      return {
        ...state,
        stats: action.stats,
        unlockedThemes: action.unlockedThemes,
        unlockedAchievements: action.unlockedAchievements,
        toastQueue: [...state.toastQueue, ...action.toasts],
      };

    case "CLEAR_FLASH":
      if (!state.run) return state;
      return { ...state, run: { ...state.run, flashNodeId: null, flashKind: null } };

    case "TICK": {
      if (!state.run || state.screen !== "playing") return state;
      const r = state.run;
      const newTimeRemaining = r.timeRemainingMs - action.deltaMs;
      if (newTimeRemaining <= 0) {
        return {
          ...state,
          run: { ...r, timeRemainingMs: 0, gameOverReason: "time" },
          screen: "gameover",
        };
      }
      const comboExpired = r.combo > 0 && r.runClockMs - r.lastActionAt > COMBO_WINDOW_MS;
      return {
        ...state,
        run: {
          ...r,
          timeRemainingMs: newTimeRemaining,
          runClockMs: r.runClockMs + action.deltaMs,
          levelClockMs: r.levelClockMs + action.deltaMs,
          combo: comboExpired ? 0 : r.combo,
        },
      };
    }

    case "CLICK_NODE": {
      if (!state.run || state.screen !== "playing") return state;
      const r = state.run;
      const node = r.levelData.nodes.find((n) => n.id === action.nodeId);
      if (!node || node.hit) return state;

      if (node.kind === "firewall") {
        const updatedNodes = markHit(r.levelData.nodes, node.id);
        return {
          ...state,
          run: {
            ...r,
            levelData: { ...r.levelData, nodes: updatedNodes },
            timeRemainingMs: Math.max(0, r.timeRemainingMs - FIREWALL_PENALTY_MS),
            combo: 0,
            flashNodeId: node.id,
            flashKind: "firewall",
            shakeSeed: r.shakeSeed + 1,
          },
        };
      }

      if (node.kind === "bonus") {
        const updatedNodes = markHit(r.levelData.nodes, node.id);
        return {
          ...state,
          run: {
            ...r,
            levelData: { ...r.levelData, nodes: updatedNodes },
            timeRemainingMs: r.timeRemainingMs + BONUS_TIME_MS,
            score: r.score + 50,
            flashNodeId: node.id,
            flashKind: "bonus",
          },
        };
      }

      // sequence node
      if (node.order === r.nextSeq) {
        const updatedNodes = r.levelData.nodes.map((n) =>
          n.id === node.id ? { ...n, connected: true, hit: true } : n
        );
        const newCombo = r.combo + 1;
        const multiplier = 1 + newCombo * 0.15;
        const gained = Math.round(BASE_NODE_SCORE * multiplier);
        const nextSeq = r.nextSeq + 1;
        const levelComplete = nextSeq >= r.sequenceTotal;

        if (levelComplete) {
          const timeBonus = Math.round(r.timeRemainingMs / 10) + newCombo * 15;
        
          return {
            ...state,
            // The player successfully completed one level
            stats: {
              ...state.stats,
              levelsCompleted: state.stats.levelsCompleted + 1,
            },
            run: {
              ...r,
              levelData: { ...r.levelData, nodes: updatedNodes },
              score: r.score + gained + timeBonus,
              combo: newCombo,
              comboBestThisRun: Math.max(r.comboBestThisRun, newCombo),
              nextSeq,
              lastActionAt: r.runClockMs,
              flashNodeId: node.id,
              flashKind: "correct",
              levelJustCompleted: true,
              fastestLevelMsThisRun:
                r.fastestLevelMsThisRun === null
                  ? r.levelClockMs
                  : Math.min(r.fastestLevelMsThisRun, r.levelClockMs),
            },
          };
        }

        return {
          ...state,
          run: {
            ...r,
            levelData: { ...r.levelData, nodes: updatedNodes },
            score: r.score + gained,
            combo: newCombo,
            comboBestThisRun: Math.max(r.comboBestThisRun, newCombo),
            nextSeq,
            lastActionAt: r.runClockMs,
            flashNodeId: node.id,
            flashKind: "correct",
          },
        };
      } else {
        // wrong order sequence node
        return {
          ...state,
          run: {
            ...r,
            timeRemainingMs: Math.max(0, r.timeRemainingMs - MISTAKE_PENALTY_MS),
            combo: 0,
            flashNodeId: node.id,
            flashKind: "wrong",
            shakeSeed: r.shakeSeed + 1,
          },
        };
      }
    }

    case "ADVANCE_LEVEL": {
      if (!state.run) return state;
      const r = state.run;
      const nextLevelNum = r.level + 1;
      const levelData = generateLevel(nextLevelNum, r.seed);
      return {
        ...state,
        run: {
          ...r,
          level: nextLevelNum,
          levelData,
          timeRemainingMs: r.timeRemainingMs + levelData.timeLimit * 1000 * 0.35, // partial carryover + fresh budget
          timeLimitMs: levelData.timeLimit * 1000,
          nextSeq: 0,
          sequenceTotal: levelData.nodes.filter((n) => n.kind === "sequence").length,
          levelClockMs: 0,
          flashNodeId: null,
          flashKind: null,
          levelJustCompleted: false,
        },
      };
    }

    case "GAME_OVER":
      return { ...state, screen: "gameover" };

    default:
      return state;
  }
}

function markHit(nodes: GameNode[], id: number): GameNode[] {
  return nodes.map((n) => (n.id === id ? { ...n, hit: true } : n));
}
