"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/contexts/GameProvider";
import { themeById } from "@/lib/themes";
import React from "react";

export function VictoryPulse() {
  const { state } = useGame();
  const run = state.run;
  const theme = themeById(state.settings.theme);

  return (
    <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center">
      <AnimatePresence>
        {run?.levelJustCompleted && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <div
              className="font-display text-4xl font-black sm:text-6xl"
              style={{ color: theme.primary, textShadow: `0 0 20px ${theme.primary}, 0 0 60px ${theme.primary}` }}
            >
              BREACH COMPLETE
            </div>
            <div className="mt-2 font-mono text-sm text-white/60">
              Level {run.level} cleared — advancing...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
