"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { Terminal, Copy, Check, AlertCircle, FileInput, HelpCircle, Edit3 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OutputPanel() {
  const {
    output,
    error,
    isRunning,
    stdin,
    setStdin,
    activeOutputTab,
    setActiveOutputTab,
    getCode,
  } = useCodeEditorStore();

  const [copied, setCopied] = useState(false);

  const currentCode = getCode();
  const expectsInput =
    /input\s*\(|cin\s*>>|scanf\s*\(|Scanner\s*\(|readLine\s*\(|readline\s*\(/i.test(
      currentCode
    );

  const handleCopy = () => {
    const textToCopy = error || output;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Output copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-canvas-soft border-l border-hairline">
      {/* Panel header tabs */}
      <div className="h-9 px-3 bg-canvas border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveOutputTab("console")}
            className={`flex items-center gap-1.5 px-3 py-1 text-caption font-medium rounded-md transition-colors ${
              activeOutputTab === "console"
                ? "bg-canvas-soft-2 text-ink"
                : "text-mute hover:text-ink"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console
            {error && <span className="w-2 h-2 rounded-full bg-error" />}
          </button>

          <button
            onClick={() => setActiveOutputTab("stdin")}
            className={`flex items-center gap-1.5 px-3 py-1 text-caption font-medium rounded-md transition-colors ${
              activeOutputTab === "stdin"
                ? "bg-canvas-soft-2 text-ink"
                : "text-mute hover:text-ink"
            }`}
          >
            <FileInput className="w-3.5 h-3.5" />
            STDIN
            {stdin ? (
              <span className="w-2 h-2 rounded-full bg-link" />
            ) : expectsInput ? (
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            ) : null}
          </button>
        </div>

        {activeOutputTab === "console" && (output || error) && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded text-mute hover:text-ink hover:bg-canvas-soft-2 transition-colors"
              title="Copy output"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4 font-mono text-code overflow-y-auto">
        {activeOutputTab === "console" ? (
          <div className="space-y-4">
            {/* Active STDIN Indicator Banner */}
            {stdin && (
              <div className="flex items-center justify-between p-2.5 rounded-md bg-canvas border border-hairline text-caption font-sans">
                <div className="flex items-center gap-2 truncate">
                  <FileInput className="w-3.5 h-3.5 text-link shrink-0" />
                  <span className="text-mute">STDIN Input:</span>
                  <span className="text-ink font-mono truncate max-w-[200px]">
                    &quot;{stdin.replace(/\n/g, "  ")}&quot;
                  </span>
                </div>
                <button
                  onClick={() => setActiveOutputTab("stdin")}
                  className="flex items-center gap-1 text-link hover:underline shrink-0 text-caption font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            )}

            {/* Input guidance tip if code expects input but STDIN is empty */}
            {expectsInput && !stdin && (
              <div className="flex items-start gap-2.5 p-3 rounded-md bg-warning/10 border border-warning/20 text-warning text-caption font-sans">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">
                    Code requires input
                  </span>
                  <span>
                    Your code reads input (e.g. input(), cin &gt;&gt;, scanf).
                    Click the{" "}
                    <button
                      onClick={() => setActiveOutputTab("stdin")}
                      className="underline font-semibold hover:text-ink"
                    >
                      STDIN tab
                    </button>{" "}
                    to provide your input values before running!
                  </span>
                </div>
              </div>
            )}

            {isRunning ? (
              <div className="flex items-center gap-3 text-body-sm text-body py-4">
                <div className="w-4 h-4 border-2 border-hairline border-t-link rounded-full animate-spin" />
                <span>Executing code...</span>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-error text-body-sm font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Execution Error</span>
                </div>
                <pre className="text-error whitespace-pre-wrap break-words leading-relaxed text-caption">
                  {error}
                </pre>
              </div>
            ) : output ? (
              <pre className="text-ink whitespace-pre-wrap break-words leading-relaxed">
                {output}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-mute space-y-2 py-12">
                <Terminal className="w-8 h-8 opacity-40" />
                <p className="text-body-sm">
                  Click &quot;Run&quot; or press Ctrl+Enter to execute your code.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* STDIN Tab */
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-caption text-mute font-sans font-medium">
                Standard Input (STDIN)
              </label>
              {stdin && (
                <button
                  onClick={() => setStdin("")}
                  className="text-caption text-mute hover:text-error transition-colors"
                >
                  Clear STDIN
                </button>
              )}
            </div>

            <p className="text-caption text-mute font-sans">
              Enter all inputs your program expects (one per line, e.g. for
              input() in Python, cin &gt;&gt; in C++, or Scanner in Java):
            </p>

            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="e.g.&#10;Alice&#10;25"
              className="flex-1 w-full p-3 bg-canvas border border-hairline rounded-md text-ink placeholder:text-mute focus:outline-none focus:border-link font-mono text-code resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
