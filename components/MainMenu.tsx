"use client";

import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { NeonButton } from "./ui/NeonButton";
import { todayKey } from "@/lib/rng";
import React from "react";

export function MainMenu() {
  const { state, startRun, goTo } = useGame();
  const dateKey = todayKey();
  const dailyBest = state.stats.highScoreDaily[dateKey] ?? 0;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 text-center"
      >
        <div className="mb-2 font-mono text-xs uppercase tracking-[0.4em] text-cyan-neon/70">
          System Breach Protocol
        </div>
        <h1 className="font-display text-5xl font-black tracking-tight text-glow-cyan sm:text-7xl">
          NEON <span className="text-magenta-neon text-glow-magenta">HACKER</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md font-body text-sm text-white/50 sm:text-base">
          Connect the network nodes in sequence before the countdown hits zero. Avoid firewalls.
          Chain combos. Survive the endless grid.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="glass-panel w-full max-w-sm rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-6 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">High Score</div>
            <div className="font-display text-xl font-bold tabular text-cyan-neon">
              {state.stats.highScoreEndless.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Today's Best</div>
            <div className="font-display text-xl font-bold tabular text-magenta-neon">
              {dailyBest.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <NeonButton variant="primary" fullWidth onClick={() => startRun("endless")}>
            ▶ Start Endless Run
          </NeonButton>
          <NeonButton variant="secondary" fullWidth onClick={() => startRun("daily")}>
            ◆ Daily Challenge
          </NeonButton>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <NeonButton variant="ghost" onClick={() => goTo("stats")} className="text-xs">
              Stats
            </NeonButton>
            <NeonButton variant="ghost" onClick={() => goTo("achievements")} className="text-xs">
              Awards
            </NeonButton>
            <NeonButton variant="ghost" onClick={() => goTo("themes")} className="text-xs">
              Themes
            </NeonButton>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NeonButton variant="ghost" onClick={() => goTo("settings")} className="text-xs">
              ⚙ Settings
            </NeonButton>
            <NeonButton variant="ghost" onClick={() => goTo("howto")} className="text-xs">
              ? How to Play
            </NeonButton>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 font-mono text-[11px] text-white/30"
      >
        Space / Enter to select · Esc to pause · Click nodes in order 1→N
      </motion.div>
    </div>
  );
}
