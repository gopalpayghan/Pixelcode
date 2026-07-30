"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import NavigationHeader from "@/components/NavigationHeader";
import { Code2, ArrowLeft, Home, Sparkles, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink relative overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none z-0" />

      {/* Top Header */}
      <NavigationHeader />

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg mx-auto flex flex-col items-center text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-caption font-mono uppercase tracking-wider mb-6">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Error 404 — Path Not Found</span>
          </div>

          {/* Large Error Code Display */}
          <h1 className="text-[96px] sm:text-[120px] font-extrabold leading-none tracking-tighter gradient-text select-none mb-2">
            404
          </h1>

          {/* Heading */}
          <h2 className="text-display-md text-ink font-semibold tracking-tight text-balance mb-3">
            Lost in the Source Code?
          </h2>

          {/* Subtitle */}
          <p className="text-body-md text-mute max-w-md text-balance mb-8">
            The page or room session you are looking for does not exist, has been deleted, or moved to a new route.
          </p>

          {/* Terminal Code Snippet Graphic */}
          <div className="w-full bg-canvas-soft border border-hairline rounded-xl p-4 mb-8 text-left shadow-level-3 font-mono text-caption text-body">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-hairline">
              <div className="w-3 h-3 rounded-full bg-error/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
              <span className="text-mute text-[11px] ml-auto">router.ts</span>
            </div>
            <p className="text-mute">// Request Exception</p>
            <p>
              <span className="text-error">const</span> page = <span className="text-link">await</span> router.fetch(<span className="text-warning">&quot;/requested-route-404&quot;</span>);
            </p>
            <p className="text-mute mt-1">
              <span className="text-error">throw new</span> <span className="text-ink">NotFoundError</span>(<span className="text-warning">&quot;Resource return 404 null&quot;</span>);
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <Link href="/editor">
              <Button variant="primary" size="md" icon={<Code2 className="w-4 h-4" />}>
                Open Code Editor
              </Button>
            </Link>

            <Link href="/">
              <Button variant="secondary" size="md" icon={<Home className="w-4 h-4" />}>
                Go to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer minimal info */}
      <footer className="py-6 border-t border-hairline text-center text-caption text-mute relative z-10">
        <p>Pixelcode Platform • Real-Time Code Collaboration</p>
      </footer>
    </div>
  );
}
