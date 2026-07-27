"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play } from "lucide-react";

export default function HeroBand() {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh gradient backdrop */}
      <div className="absolute inset-0 mesh-gradient" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas"
        aria-hidden="true"
      />

      <div className="relative max-w-page mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-caption text-body">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
              10+ languages supported
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mt-8 text-display-xl sm:text-[56px] sm:leading-[56px] lg:text-[72px] lg:leading-[72px] tracking-[-0.04em] text-ink text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Code, collaborate,{" "}
            <span className="gradient-text">ship.</span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            className="mt-6 text-body-lg text-body max-w-xl mx-auto text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Write, execute, and share code in your browser. Real-time
            pair programming with live cursors. A community of developers
            sharing solutions.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/editor">
              <Button
                variant="primary"
                size="lg"
                pill
                icon={<Play className="w-4 h-4" />}
              >
                Start Coding
              </Button>
            </Link>
            <Link href="/snippets">
              <Button
                variant="secondary"
                size="lg"
                pill
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Snippets
              </Button>
            </Link>
          </motion.div>

          {/* Keyboard hint */}
          <motion.p
            className="mt-6 text-caption text-mute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft font-mono text-[11px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-canvas-soft font-mono text-[11px]">
              Enter
            </kbd>{" "}
            to run code
          </motion.p>
        </div>
      </div>
    </section>
  );
}
