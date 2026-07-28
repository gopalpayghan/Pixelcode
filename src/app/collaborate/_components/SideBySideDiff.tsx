"use client";

import { useMemo } from "react";
import { Shield, Code2 } from "lucide-react";

interface SideBySideDiffProps {
  originalCode: string;
  proposedCode: string;
  originalTitle?: string;
  proposedTitle?: string;
}

export default function SideBySideDiff({
  originalCode,
  proposedCode,
  originalTitle = "Admin's Code (Master)",
  proposedTitle = "Your Draft (Proposed)",
}: SideBySideDiffProps) {
  const diff = useMemo(() => {
    const origLines = originalCode.split("\n");
    const propLines = proposedCode.split("\n");
    const maxLen = Math.max(origLines.length, propLines.length);

    const left: { lineNumber: number; content: string; isChanged: boolean }[] = [];
    const right: { lineNumber: number; content: string; isChanged: boolean }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = i < origLines.length ? origLines[i] : null;
      const prop = i < propLines.length ? propLines[i] : null;
      const isDifferent = orig !== prop;

      if (orig !== null) {
        left.push({
          lineNumber: i + 1,
          content: orig,
          isChanged: isDifferent,
        });
      }

      if (prop !== null) {
        right.push({
          lineNumber: i + 1,
          content: prop,
          isChanged: isDifferent,
        });
      }
    }

    return { left, right };
  }, [originalCode, proposedCode]);

  return (
    <div className="flex flex-col md:flex-row h-full border border-hairline rounded-lg overflow-hidden bg-canvas font-mono text-code">
      {/* Left side: Original / Admin Code */}
      <div className="flex-1 min-w-0 border-b md:border-b-0 md:border-r border-hairline flex flex-col">
        <div className="h-8 px-3 bg-canvas-soft border-b border-hairline flex items-center gap-2 text-caption text-mute shrink-0">
          <Shield className="w-3.5 h-3.5 text-link" />
          <span className="font-semibold text-ink">{originalTitle}</span>
        </div>
        <div className="flex-1 overflow-auto p-2 bg-canvas">
          {diff.left.map((item) => (
            <div
              key={item.lineNumber}
              className={`flex items-start gap-2.5 px-2 py-0.5 rounded ${
                item.isChanged
                  ? "bg-error/15 text-error font-medium"
                  : "text-body"
              }`}
            >
              <span className="w-6 text-right text-mute/50 text-[11px] select-none shrink-0">
                {item.lineNumber}
              </span>
              <span className="whitespace-pre-wrap break-all leading-relaxed flex-1">
                {item.content || " "}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Proposed / Your Draft */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-8 px-3 bg-canvas-soft border-b border-hairline flex items-center gap-2 text-caption text-mute shrink-0">
          <Code2 className="w-3.5 h-3.5 text-success" />
          <span className="font-semibold text-ink">{proposedTitle}</span>
        </div>
        <div className="flex-1 overflow-auto p-2 bg-canvas">
          {diff.right.map((item) => (
            <div
              key={item.lineNumber}
              className={`flex items-start gap-2.5 px-2 py-0.5 rounded ${
                item.isChanged
                  ? "bg-success/15 text-success font-medium"
                  : "text-ink"
              }`}
            >
              <span className="w-6 text-right text-mute/50 text-[11px] select-none shrink-0">
                {item.lineNumber}
              </span>
              <span className="whitespace-pre-wrap break-all leading-relaxed flex-1">
                {item.content || " "}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
