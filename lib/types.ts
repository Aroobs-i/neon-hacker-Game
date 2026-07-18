export type NodeKind = "sequence" | "firewall" | "bonus";

export interface GameNode {
  id: number;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  kind: NodeKind;
  order: number | null; // sequence position, null for firewall/bonus
  connected: boolean;
  hit: boolean; // bonus consumed / firewall triggered
  radius: number; // normalized radius relative to canvas min-dimension
}

export interface LevelData {
  level: number;
  nodes: GameNode[];
  timeLimit: number;
  seed: number;
}

export type ThemeId = "cyan" | "matrix" | "blood" | "gold" | "violet";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  primary: string;
  secondary: string;
  unlockHint: string;
}

export type GameMode = "endless" | "daily";

export type Screen =
  | "menu"
  | "playing"
  | "paused"
  | "gameover"
  | "settings"
  | "stats"
  | "achievements"
  | "themes"
  | "howto";

export interface Settings {
  soundOn: boolean;
  musicOn: boolean;
  screenShakeOn: boolean;
  particlesOn: boolean;
  theme: ThemeId;
}

export interface Stats {
  gamesPlayed: number;
  levelsCompleted: number;
  totalScore: number;
  bestCombo: number;
  fastestLevelMs: number | null;
  highestLevel: number;
  highScoreEndless: number;
  highScoreDaily: Record<string, number>;
  totalPlayTimeMs: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (stats: Stats, ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  comboThisRun: number;
  lastLevelTimeMs: number | null;
  levelReachedThisRun: number;
}

export interface SaveData {
  settings: Settings;
  stats: Stats;
  unlockedThemes: ThemeId[];
  unlockedAchievements: string[];
}
