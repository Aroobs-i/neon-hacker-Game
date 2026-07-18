"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { themeById } from "@/lib/themes";
import React from "react";

export function HUD() {
  const { state, pause } = useGame();
  const run = state.run;
  if (!run) return null;
  const theme = themeById(state.settings.theme);

  const pct = Math.max(0, Math.min(1, run.timeRemainingMs / run.timeLimitMs));
  const urgent = run.timeRemainingMs < 5000;
  const seconds = (run.timeRemainingMs / 1000).toFixed(1);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="glass-panel pointer-events-auto rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {run.mode === "daily" ? "Daily Breach" : "Level"}
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-glow-cyan" style={{ color: theme.primary }}>
            {String(run.level).padStart(2, "0")}
          </div>
        </div>

        <div className="glass-panel pointer-events-auto rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Score</div>
          <div className="font-display tabular text-xl sm:text-2xl font-bold text-white">
            {run.score.toLocaleString()}
          </div>
        </div>

        <button
          onClick={pause}
          aria-label="Pause game"
          className="focus-neon glass-panel pointer-events-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white/80 transition hover:text-white active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="glass-panel h-3 flex-1 overflow-hidden rounded-full p-[2px]">
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${pct * 100}%`,
              backgroundColor: urgent ? "#ff3860" : theme.primary,
            }}
            transition={{ duration: 0.15, ease: "linear" }}
            style={{
              boxShadow: `0 0 10px ${urgent ? "#ff3860" : theme.primary}`,
            }}
          />
        </div>
        <div
          className={`glass-panel rounded-xl px-3 py-1.5 font-mono text-sm font-bold tabular ${
            urgent ? "text-danger-neon animate-pulse-glow" : "text-white"
          }`}
        >
          {seconds}s
        </div>
      </div>

      <AnimatePresence>
        {run.combo > 1 && (
          <motion.div
            key={run.combo}
            initial={{ scale: 0.6, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="pointer-events-none self-center"
          >
            <div
              className="rounded-full px-5 py-1.5 font-display text-lg font-black tracking-wider"
              style={{
                color: theme.secondary,
                textShadow: `0 0 10px ${theme.secondary}, 0 0 24px ${theme.secondary}`,
              }}
            >
              {run.combo}x COMBO
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
