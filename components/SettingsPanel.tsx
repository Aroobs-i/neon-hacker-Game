"use client";

import { useGame } from "@/contexts/GameProvider";
import { Panel } from "./ui/Panel";
import React from "react";

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="focus-neon flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-cyan-neon/40"
    >
      <div>
        <div className="font-body text-sm font-semibold text-white">{label}</div>
        <div className="font-mono text-[11px] text-white/40">{desc}</div>
      </div>
      <div
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
          value ? "bg-cyan-neon/80" : "bg-white/15"
        }`}
      >
        <div
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

export function SettingsPanel() {
  const { state, updateSettings, goBack } = useGame();
  const s = state.settings;

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
      <Panel title="Settings" subtitle="Tune your breach experience" onClose={goBack} className="max-w-md">
        <div className="flex flex-col gap-3">
          <Toggle
            label="Sound Effects"
            desc="Node connects, warnings, victories"
            value={s.soundOn}
            onChange={(v) => updateSettings({ soundOn: v })}
          />
          <Toggle
            label="Ambient Music"
            desc="Generative background drone"
            value={s.musicOn}
            onChange={(v) => updateSettings({ musicOn: v })}
          />
          <Toggle
            label="Screen Shake"
            desc="Camera kick on mistakes and firewalls"
            value={s.screenShakeOn}
            onChange={(v) => updateSettings({ screenShakeOn: v })}
          />
          <Toggle
            label="Particles"
            desc="Ambient floating particles and bursts"
            value={s.particlesOn}
            onChange={(v) => updateSettings({ particlesOn: v })}
          />
        </div>
      </Panel>
    </div>
  );
}
