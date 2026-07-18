import { SaveData, Settings, Stats, ThemeId } from "./types";

const STORAGE_KEY = "neon-hacker-save-v1";

export const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  musicOn: true,
  screenShakeOn: true,
  particlesOn: true,
  theme: "cyan",
};

export const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  levelsCompleted: 0,
  totalScore: 0,
  bestCombo: 0,
  fastestLevelMs: null,
  highestLevel: 0,
  highScoreEndless: 0,
  highScoreDaily: {},
  totalPlayTimeMs: 0,
};

export const DEFAULT_SAVE: SaveData = {
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
  unlockedThemes: ["cyan"],
  unlockedAchievements: [],
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadSave(): SaveData {
  if (!isBrowser()) return structuredCloneSafe(DEFAULT_SAVE);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_SAVE);
    const parsed = JSON.parse(raw);
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      stats: { ...DEFAULT_STATS, ...parsed.stats },
      unlockedThemes: parsed.unlockedThemes?.length ? parsed.unlockedThemes : ["cyan"],
      unlockedAchievements: parsed.unlockedAchievements ?? [],
    };
  } catch {
    return structuredCloneSafe(DEFAULT_SAVE);
  }
}

export function persistSave(data: SaveData) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable (private mode / quota) — fail silently, game still playable
  }
}

function structuredCloneSafe<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function unlockTheme(save: SaveData, theme: ThemeId): SaveData {
  if (save.unlockedThemes.includes(theme)) return save;
  return { ...save, unlockedThemes: [...save.unlockedThemes, theme] };
}
