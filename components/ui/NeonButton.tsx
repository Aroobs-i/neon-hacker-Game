"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { audioEngine } from "@/lib/audio";
import React from "react";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-cyan-neon/20 to-magenta-neon/20 border-cyan-neon/60 text-cyan-neon shadow-neon-cyan hover:from-cyan-neon/30 hover:to-magenta-neon/30",
  secondary: "glass-panel border-white/15 text-white/90 hover:border-white/30",
  ghost: "border-transparent text-white/60 hover:text-white hover:bg-white/5",
  danger: "bg-danger-neon/10 border-danger-neon/50 text-danger-neon hover:bg-danger-neon/20",
};

export function NeonButton({
  children,
  variant = "primary",
  onClick,
  fullWidth,
  icon,
  className = "",
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => audioEngine.uiHover()}
      onClick={() => {
        audioEngine.uiClick();
        onClick?.();
      }}
      className={`focus-neon flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...(rest as any)}
    >
      {icon}
      {children}
    </motion.button>
  );
}
