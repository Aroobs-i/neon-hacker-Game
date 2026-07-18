"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import React from "react";

export function Panel({
  children,
  className = "",
  title,
  subtitle,
  onClose,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`glass-panel relative w-full rounded-3xl p-6 sm:p-8 shadow-glass ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="focus-neon absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      )}
      {title && (
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 font-body text-sm text-white/50">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
