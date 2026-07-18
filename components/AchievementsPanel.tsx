"use client";

import { useGame } from "@/contexts/GameProvider";
import { Panel } from "./ui/Panel";
import { ACHIEVEMENTS } from "@/lib/achievements";
import React from "react";

export function AchievementsPanel() {
  const { state, goBack } = useGame();

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
      <Panel title="Achievements" subtitle="Prove your skill on the grid" onClose={goBack} className="max-w-md">
        <div className="flex flex-col gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = state.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  unlocked
                    ? "border-cyan-neon/40 bg-cyan-neon/5"
                    : "border-white/10 bg-white/[0.02] opacity-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                    unlocked ? "bg-cyan-neon/20 text-cyan-neon" : "bg-white/5 text-white/30"
                  }`}
                >
                  {unlocked ? "★" : "🔒"}
                </div>
                <div>
                  <div className="font-body text-sm font-semibold text-white">{a.title}</div>
                  <div className="font-mono text-[11px] text-white/40">{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
