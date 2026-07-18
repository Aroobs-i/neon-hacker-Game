"use client";

import { useGame } from "@/contexts/GameProvider";
import { Panel } from "./ui/Panel";
import React from "react";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="font-body text-sm text-white/60">{label}</span>
      <span className="font-mono text-sm font-bold tabular text-cyan-neon">{value}</span>
    </div>
  );
}

export function StatsPanel() {
  const { state, goBack } = useGame();
  const s = state.stats;
  const minutes = Math.floor(s.totalPlayTimeMs / 60000);

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
      <Panel title="Statistics" subtitle="Your breach history" onClose={goBack} className="max-w-md">
        <StatRow label="Games Played" value={s.gamesPlayed.toLocaleString()} />
        <StatRow label="Levels Completed" value={s.levelsCompleted.toLocaleString()} />
        <StatRow label="Highest Level Reached" value={s.highestLevel.toLocaleString()} />
        <StatRow label="Best Combo" value={`${s.bestCombo}x`} />
        <StatRow
          label="Fastest Level"
          value={s.fastestLevelMs !== null ? `${(s.fastestLevelMs / 1000).toFixed(2)}s` : "—"}
        />
        <StatRow label="Endless High Score" value={s.highScoreEndless.toLocaleString()} />
        <StatRow label="Total Score (lifetime)" value={s.totalScore.toLocaleString()} />
        <StatRow label="Time Played" value={`${minutes} min`} />
      </Panel>
    </div>
  );
}
