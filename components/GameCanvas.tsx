"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGame } from "@/contexts/GameProvider";
import { useRafLoop } from "@/hooks/useRafLoop";
import { ParticleSystem } from "@/lib/particles";
import { audioEngine } from "@/lib/audio";
import React from "react";
import { themeById } from "@/lib/themes";
import { GameNode } from "@/lib/types";

const DANGER_COLOR = "#ff3860";
const BONUS_COLOR = "#ffd23f";

export function GameCanvas() {
  const { state, clickNode, tick, clearFlash } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef(new ParticleSystem());
  const shakeRef = useRef({ mag: 0, seenSeed: 0 });
  const hoverRef = useRef<number | null>(null);
  const flashClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  const theme = themeById(state.settings.theme);
  const run = state.run;
  const isPlaying = state.screen === "playing";

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { w: rect.width, h: rect.height };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!run || !run.flashNodeId || !run.flashKind) return;
    const node = run.levelData.nodes.find((n) => n.id === run.flashNodeId);
    const { w, h } = dimsRef.current;
    if (node && w && h) {
      const px = node.x * w;
      const py = node.y * h;
      if (run.flashKind === "correct") {
        particlesRef.current.burst(px, py, theme.primary, 22, 3);
        audioEngine.nodeConnect(run.combo);
      } else if (run.flashKind === "wrong") {
        particlesRef.current.burst(px, py, DANGER_COLOR, 12, 2);
        audioEngine.wrongMove();
      } else if (run.flashKind === "firewall") {
        particlesRef.current.burst(px, py, DANGER_COLOR, 26, 4);
        audioEngine.firewallHit();
      } else if (run.flashKind === "bonus") {
        particlesRef.current.burst(px, py, BONUS_COLOR, 20, 3);
        audioEngine.bonusPickup();
      }
    }
    if (run.shakeSeed !== shakeRef.current.seenSeed) {
      shakeRef.current.seenSeed = run.shakeSeed;
      if (state.settings.screenShakeOn) shakeRef.current.mag = 10;
    }
    if (flashClearTimer.current) clearTimeout(flashClearTimer.current);
    flashClearTimer.current = setTimeout(() => clearFlash(), 260);
    return () => {
      if (flashClearTimer.current) clearTimeout(flashClearTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.flashNodeId, run?.flashKind, run?.shakeSeed]);

  const handlePointer = useCallback(
    (clientX: number, clientY: number, isClick: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas || !run) return;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      let closest: GameNode | null = null;
      let closestDist = Infinity;
      for (const n of run.levelData.nodes) {
        const dx = n.x - x;
        const dy = n.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = n.radius * 1.7;
        if (dist < hitRadius && dist < closestDist) {
          closest = n;
          closestDist = dist;
        }
      }
      if (isClick) {
        if (closest && !closest.hit) clickNode(closest.id);
      } else {
        hoverRef.current = closest ? closest.id : null;
      }
    },
    [run, clickNode]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = (e: MouseEvent) => handlePointer(e.clientX, e.clientY, true);
    const onMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY, false);
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) handlePointer(t.clientX, t.clientY, true);
    };
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    return () => {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchstart", onTouch);
    };
  }, [handlePointer]);

  useRafLoop(isPlaying, (deltaMs) => {
    tick(deltaMs);
    render(deltaMs);
  });

  function render(deltaMs: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !run) return;
    const { w, h } = dimsRef.current;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    shakeRef.current.mag *= 0.86;
    const shakeMag = shakeRef.current.mag;
    const sx = shakeMag > 0.1 ? (Math.random() - 0.5) * shakeMag : 0;
    const sy = shakeMag > 0.1 ? (Math.random() - 0.5) * shakeMag : 0;
    ctx.save();
    ctx.translate(sx, sy);

    if (state.settings.particlesOn && Math.random() < 0.4) {
      particlesRef.current.ambient(Math.random() * w, h + 4, `${theme.primary}55`);
    }

    const seqNodes = run.levelData.nodes
      .filter((n) => n.kind === "sequence")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    ctx.lineCap = "round";
    for (let i = 0; i < seqNodes.length - 1; i++) {
      const a = seqNodes[i];
      const b = seqNodes[i + 1];
      if (a.connected && b.connected) {
        drawLine(ctx, a.x * w, a.y * h, b.x * w, b.y * h, theme.primary, 3.2);
      } else if (a.connected && a.order === run.nextSeq - 1) {
        drawLine(ctx, a.x * w, a.y * h, b.x * w, b.y * h, `${theme.primary}33`, 1.5, true);
      }
    }

    for (const n of run.levelData.nodes) {
      drawNode(ctx, n, w, h, theme.primary, theme.secondary, run.nextSeq, hoverRef.current === n.id);
    }

    ctx.restore();

    particlesRef.current.update(deltaMs / 16.6);
    particlesRef.current.draw(ctx);
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair touch-none" />
    </div>
  );
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
  dashed = false
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  if (dashed) ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  n: GameNode,
  w: number,
  h: number,
  primary: string,
  secondary: string,
  nextSeq: number,
  isHovered: boolean
) {
  const x = n.x * w;
  const y = n.y * h;
  const r = n.radius * Math.min(w, h);
  const isNext = n.kind === "sequence" && n.order === nextSeq && !n.connected;

  let color = primary;
  if (n.kind === "firewall") color = DANGER_COLOR;
  if (n.kind === "bonus") color = BONUS_COLOR;
  if (n.kind === "sequence" && n.connected) color = secondary;

  const pulse = isNext ? 1 + 0.12 * Math.sin(Date.now() / 220) : 1;
  const radius = r * pulse * (isHovered ? 1.15 : 1);

  ctx.save();
  ctx.beginPath();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
  grad.addColorStop(0, `${color}88`);
  grad.addColorStop(1, `${color}00`);
  ctx.fillStyle = grad;
  ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = n.hit && n.kind !== "sequence" ? "#1a1e2a" : "#0c0f18";
  ctx.strokeStyle = color;
  ctx.lineWidth = isNext ? 3.2 : 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = isNext ? 22 : 12;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${Math.max(10, radius * 0.9)}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (n.kind === "sequence") {
    ctx.fillText(String((n.order ?? 0) + 1), x, y + 1);
  } else if (n.kind === "firewall") {
    ctx.fillText("\u2715", x, y + 1);
  } else if (n.kind === "bonus") {
    ctx.fillText("+", x, y + 1);
  }
  ctx.restore();
}
