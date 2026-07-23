"use client";

import { motion } from "framer-motion";

/** A glowing "live" status dot with a looping ping ring — the streamerOS signal. */
export function PulseDot({ className = "", color = "bg-ice" }: { className?: string; color?: string }) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 ${className}`}>
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${color}`}
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}
