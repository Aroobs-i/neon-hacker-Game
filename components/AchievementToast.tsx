"use client";

import { useEffect } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";

export function AchievementToast() {
  const { state, dismissToast } = useGame();
  const current = state.toastQueue[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => dismissToast(), 3600);
    return () => clearTimeout(t);
  }, [current, dismissToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="glass-panel flex items-center gap-3 rounded-2xl border-amber-neon/50 px-5 py-3 shadow-[0_0_30px_rgba(255,210,63,0.35)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-neon/20 text-xl text-amber-neon">
              ★
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-amber-neon">
                Achievement Unlocked
              </div>
              <div className="font-display text-sm font-bold text-white">{current.title}</div>
              <div className="font-mono text-[11px] text-white/50">{current.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
