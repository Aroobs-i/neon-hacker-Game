"use client";

import { useGame } from "@/contexts/GameProvider";
import { Panel } from "./ui/Panel";
import React from "react";

const rules = [
  { icon: "①", title: "Connect in order", desc: "Click the numbered nodes from 1 upward to draw a live connection." },
  { icon: "✕", title: "Avoid firewalls", desc: "Red nodes cost you time if triggered. Route around them." },
  { icon: "+", title: "Grab bonus nodes", desc: "Amber nodes add extra seconds and score — safe to click anytime." },
  { icon: "⚡", title: "Chain combos", desc: "Fast, consecutive correct clicks build a multiplier. Don't stall too long." },
  { icon: "∞", title: "Survive forever", desc: "Every level adds more nodes, more firewalls, and less time." },
];

export function HowToPlay() {
  const { goBack } = useGame();
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
      <Panel title="How to Play" subtitle="Breach the grid before time runs out" onClose={goBack} className="max-w-md">
        <div className="flex flex-col gap-3">
          {rules.map((r) => (
            <div key={r.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-neon/15 font-mono text-base font-bold text-cyan-neon">
                {r.icon}
              </div>
              <div>
                <div className="font-body text-sm font-semibold text-white">{r.title}</div>
                <div className="font-mono text-[11px] leading-relaxed text-white/40">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
