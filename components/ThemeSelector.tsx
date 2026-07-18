"use client";

import { useGame } from "@/contexts/GameProvider";
import { Panel } from "./ui/Panel";
import { THEMES } from "@/lib/themes";
import { audioEngine } from "@/lib/audio";
import React from "react";

export function ThemeSelector() {
  const { state, updateSettings, goBack } = useGame();

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
      <Panel title="Themes" subtitle="Unlockable color protocols" onClose={goBack} className="max-w-md">
        <div className="grid grid-cols-1 gap-3">
          {THEMES.map((t) => {
            const unlocked = state.unlockedThemes.includes(t.id);
            const active = state.settings.theme === t.id;
            return (
              <button
                key={t.id}
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) {
                    audioEngine.uiClick();
                    updateSettings({ theme: t.id });
                  }
                }}
                className={`focus-neon flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition ${
                  active
                    ? "border-white/60 bg-white/10"
                    : unlocked
                    ? "border-white/10 bg-white/[0.03] hover:border-white/30"
                    : "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-40"
                }`}
              >
                <div className="flex gap-1.5">
                  <span
                    className="h-8 w-8 rounded-full"
                    style={{ background: t.primary, boxShadow: `0 0 12px ${t.primary}` }}
                  />
                  <span
                    className="h-8 w-8 rounded-full"
                    style={{ background: t.secondary, boxShadow: `0 0 12px ${t.secondary}` }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-body text-sm font-semibold text-white">{t.name}</div>
                  <div className="font-mono text-[11px] text-white/40">
                    {unlocked ? "Unlocked" : t.unlockHint}
                  </div>
                </div>
                {active && <span className="text-cyan-neon">✓</span>}
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
