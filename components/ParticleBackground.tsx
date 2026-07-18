"use client";

import { useMemo } from "react";
import { themeById } from "@/lib/themes";
import { useGame } from "@/contexts/GameProvider";
import React from "react";

export function ParticleBackground() {
  const { state } = useGame();
  const theme = themeById(state.settings.theme);

  const dots = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 6,
        color: i % 3 === 0 ? theme.secondary : theme.primary,
      })),
    [theme.primary, theme.secondary]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="animated-gradient absolute inset-0 opacity-90" />
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute animate-float rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 8px ${d.color}`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: 0.7,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />
    </div>
  );
}
