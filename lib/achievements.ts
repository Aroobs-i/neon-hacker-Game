import { AchievementContext, AchievementDef, Stats } from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "levels-10",
    title: "Script Kiddie",
    description: "Finish 10 levels",
    check: (stats) => stats.levelsCompleted >= 10,
  },
  {
    id: "combo-10",
    title: "Chain Reaction",
    description: "Reach a x10 combo",
    check: (stats) => stats.bestCombo >= 10,
  },
  {
    id: "speed-10s",
    title: "Zero Latency",
    description: "Finish a level in under 10 seconds",
    check: (stats) => stats.fastestLevelMs !== null && stats.fastestLevelMs < 10000,
  },
  {
    id: "games-50",
    title: "Night Owl",
    description: "Play 50 games",
    check: (stats) => stats.gamesPlayed >= 50,
  },
  {
    id: "level-100",
    title: "Ghost in the Machine",
    description: "Reach level 100",
    check: (stats) => stats.highestLevel >= 100,
  },
];

/** Returns achievement ids newly unlocked this evaluation (not previously owned). */
export function evaluateAchievements(
  stats: Stats,
  ctx: AchievementContext,
  alreadyUnlocked: string[]
): string[] {
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (alreadyUnlocked.includes(a.id)) continue;
    if (a.check(stats, ctx)) newly.push(a.id);
  }
  return newly;
}
