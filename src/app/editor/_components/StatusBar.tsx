"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG } from "@/lib/constants";
import { Cpu, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import useMounted from "@/hooks/useMounted";

export default function StatusBar() {
  const mounted = useMounted();
  const { language, isRunning, error } = useCodeEditorStore();
  const currentLang = (mounted ? LANGUAGE_CONFIG[language] : null) || LANGUAGE_CONFIG.javascript;

  return (
    <div className="h-6 px-4 bg-canvas-soft border-t border-hairline flex items-center justify-between text-[11px] font-mono text-mute select-none">
      {/* Left status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 text-warning animate-spin" />
              <span className="text-warning">Executing...</span>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-3 h-3 text-error" />
              <span className="text-error">Error</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-body">Ready</span>
            </>
          )}
        </div>

        <span className="text-hairline">|</span>

        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-mute" />
          <span>Piston Engine v{currentLang.pistonRuntime.version}</span>
        </div>
      </div>

      {/* Right details */}
      <div className="flex items-center gap-3">
        <span>UTF-8</span>
        <span className="text-hairline">|</span>
        <span className="text-ink font-medium">{currentLang.label}</span>
      </div>
    </div>
  );
}
