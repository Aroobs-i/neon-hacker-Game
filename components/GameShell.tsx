"use client";

import { AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ParticleBackground } from "./ParticleBackground";
import { MainMenu } from "./MainMenu";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";
import React from "react";
import { VictoryPulse } from "./VictoryPulse";
import { PauseMenu } from "./PauseMenu";
import { GameOverScreen } from "./GameOverScreen";
import { SettingsPanel } from "./SettingsPanel";
import { StatsPanel } from "./StatsPanel";
import { AchievementsPanel } from "./AchievementsPanel";
import { ThemeSelector } from "./ThemeSelector";
import { HowToPlay } from "./HowToPlay";
import { AchievementToast } from "./AchievementToast";

const OVERLAY_SCREENS = new Set(["settings", "stats", "achievements", "themes", "howto"]);

export function GameShell() {
  const { state } = useGame();
  useKeyboardShortcuts();

  const runActive = !!state.run;
  const showCanvas = runActive && (state.screen === "playing" || state.screen === "paused" || state.screen === "gameover");

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-void">
      <ParticleBackground />
      <AchievementToast />

      {showCanvas && (
        <div className="absolute inset-0 z-10">
          <GameCanvas />
          <HUD />
          <VictoryPulse />
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.screen === "paused" && <PauseMenu key="pause" />}
        {state.screen === "gameover" && <GameOverScreen key="gameover" />}
      </AnimatePresence>

      {state.screen === "menu" && <MainMenu />}
      {OVERLAY_SCREENS.has(state.screen) && (
        <div className="relative z-10">
          {state.screen === "settings" && <SettingsPanel />}
          {state.screen === "stats" && <StatsPanel />}
          {state.screen === "achievements" && <AchievementsPanel />}
          {state.screen === "themes" && <ThemeSelector />}
          {state.screen === "howto" && <HowToPlay />}
        </div>
      )}
    </main>
  );
}
