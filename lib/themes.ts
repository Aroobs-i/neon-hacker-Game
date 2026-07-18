import { ThemeDef, ThemeId, Stats } from "./types";

export const THEMES: ThemeDef[] = [
  {
    id: "cyan",
    name: "Cyan Protocol",
    primary: "#00f0ff",
    secondary: "#ff2e9a",
    unlockHint: "Available from the start",
  },
  {
    id: "matrix",
    name: "Matrix Green",
    primary: "#39ff88",
    secondary: "#00f0ff",
    unlockHint: "Complete 10 levels",
  },
  {
    id: "blood",
    name: "Blood Red",
    primary: "#ff3860",
    secondary: "#ffd23f",
    unlockHint: "Reach a x10 combo",
  },
  {
    id: "gold",
    name: "Gold Rush",
    primary: "#ffcf5c",
    secondary: "#ff2e9a",
    unlockHint: "Reach level 100",
  },
  {
    id: "violet",
    name: "Violet Static",
    primary: "#b45cff",
    secondary: "#00f0ff",
    unlockHint: "Play 50 games",
  },
];

export function themeById(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Which themes should now be unlocked given current stats. */
export function themesToUnlock(stats: Stats): ThemeId[] {
  const unlocked: ThemeId[] = ["cyan"];
  if (stats.levelsCompleted >= 10) unlocked.push("matrix");
  if (stats.bestCombo >= 10) unlocked.push("blood");
  if (stats.highestLevel >= 100) unlocked.push("gold");
  if (stats.gamesPlayed >= 50) unlocked.push("violet");
  return unlocked;
}
