"use client";

import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { NeonButton } from "./ui/NeonButton";
import { Panel } from "./ui/Panel";
import React from "react";

export function PauseMenu() {
  const { state, resume, quitToMenu, restartRun, goTo } = useGame();
  if (!state.run) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <Panel title="Paused" subtitle="The grid is waiting." className="max-w-sm">
        <div className="mb-6 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Level</div>
            <div className="font-display text-lg font-bold text-white">{state.run.level}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Score</div>
            <div className="font-display text-lg font-bold text-white">{state.run.score.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <NeonButton variant="primary" fullWidth onClick={resume}>
            ▶ Resume
          </NeonButton>
          <NeonButton variant="secondary" fullWidth onClick={restartRun}>
            ↺ Restart Run
          </NeonButton>
          <NeonButton variant="ghost" fullWidth onClick={() => goTo("settings")}>
            ⚙ Settings
          </NeonButton>
          <NeonButton variant="danger" fullWidth onClick={quitToMenu}>
            ⏻ Quit to Menu
          </NeonButton>
        </div>
      </Panel>
    </motion.div>
  );
}
