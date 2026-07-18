"use client";

import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { NeonButton } from "./ui/NeonButton";
import { Panel } from "./ui/Panel";
import { todayKey } from "@/lib/rng";
import React from "react";

export function GameOverScreen() {
  const { state, startRun, quitToMenu } = useGame();
  const run = state.run;
  if (!run) return null;

  const isDaily = run.mode === "daily";
  const dateKey = todayKey();
  const priorBest = isDaily
    ? state.stats.highScoreDaily[dateKey] ?? 0
    : state.stats.highScoreEndless;
  const isNewHighScore = run.score >= priorBest && run.score > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <Panel className="max-w-sm text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-danger-neon">
            Connection Terminated
          </div>
          <h2 className="font-display text-3xl font-black text-white">GRID BREACH FAILED</h2>

          {isNewHighScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mt-3 inline-block rounded-full bg-amber-neon/15 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-neon"
            >
              ✦ New High Score ✦
            </motion.div>
          )}
        </motion.div>

        <div className="my-6 grid grid-cols-3 gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Score</div>
            <div className="font-display text-2xl font-bold tabular text-cyan-neon">
              {run.score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Level</div>
            <div className="font-display text-2xl font-bold tabular text-white">{run.level}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Best Combo</div>
            <div className="font-display text-2xl font-bold tabular text-magenta-neon">
              {run.comboBestThisRun}x
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <NeonButton variant="primary" fullWidth onClick={() => startRun(run.mode)}>
            ↺ Try Again
          </NeonButton>
          <NeonButton variant="secondary" fullWidth onClick={quitToMenu}>
            Main Menu
          </NeonButton>
        </div>
      </Panel>
    </motion.div>
  );
}
