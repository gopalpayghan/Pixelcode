"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { Terminal, Copy, Check, AlertCircle, FileInput, HelpCircle, Edit3, CornerDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

function getExpectedInputInfo(code: string) {
  if (/nextInt\s*\(|\bint\s*\(\s*input|Integer\.parseInt/i.test(code)) {
    return {
      typeLabel: "Integer Number (e.g. 25)",
      placeholder: "Enter an Integer number (e.g. 25)...",
      badgeColor: "bg-link/15 text-link border-link/30",
    };
  }
  if (/nextDouble\s*\(|nextFloat\s*\(|\bfloat\s*\(\s*input|Double\.parseDouble/i.test(code)) {
    return {
      typeLabel: "Decimal Number (e.g. 3.14)",
      placeholder: "Enter a Decimal number (e.g. 3.14)...",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
  }
  if (/nextBoolean\s*\(/i.test(code)) {
    return {
      typeLabel: "Boolean (true / false)",
      placeholder: "Enter true or false...",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (/nextLine\s*\(|next\s*\(|input\s*\(|readLine|scanf/i.test(code)) {
    return {
      typeLabel: "Text String",
      placeholder: "Enter text string (e.g. Alex)...",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  }
  return {
    typeLabel: "Input Value",
    placeholder: "Type console input & press Enter...",
    badgeColor: "bg-canvas border-hairline text-ink",
  };
}

function getStepByStepPrompts(code: string, stdin: string) {
  const prompts: string[] = [];

  // Extract python input("...")
  const pyMatches = code.matchAll(/input\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const m of pyMatches) {
    if (m[1]?.trim()) prompts.push(m[1].trim());
  }

  // If no python input() strings, extract print/cout/System.out prompts
  if (prompts.length === 0) {
    const printMatches = code.matchAll(
      /(?:System\.out\.print(?:ln)?|cout\s*<<|Console\.Write(?:Line)?|fmt\.Print(?:ln)?|print(?:ln)?|puts|prompt)\s*\(\s*["']([^"']+)["']\s*\)/g
    );
    for (const m of printMatches) {
      const text = m[1]?.trim();
      if (
        text &&
        !text.startsWith("---") &&
        !text.startsWith("===") &&
        (text.endsWith(":") || text.includes("Enter") || text.includes("Input") || text.includes("select") || text.includes("choose") || text.includes("?"))
      ) {
        prompts.push(text);
      }
    }
  }

  const inputLines = stdin ? stdin.split("\n").filter((l) => l.trim().length > 0) : [];
  const currentStep = inputLines.length;
  const activePrompt = prompts[currentStep] || null;

  return {
    totalPrompts: prompts.length,
    currentStep: currentStep + 1,
    activePrompt,
    prompts,
  };
}

export default function OutputPanel() {
  const {
    language,
    output,
    error,
    isRunning,
    stdin,
    setStdin,
    runCode,
    activeOutputTab,
    setActiveOutputTab,
    getCode,
  } = useCodeEditorStore();

  const [copied, setCopied] = useState(false);
  const [directInput, setDirectInput] = useState("");

  // Auto-refresh local console input when language changes
  useEffect(() => {
    setDirectInput("");
  }, [language]);

  const currentCode = getCode();
  const expectsInput =
    /input\s*\(|cin\s*>>|scanf\s*\(|Scanner\s*\(|readLine\s*\(|readline\s*\(/i.test(
      currentCode
    );

  const inputInfo = getExpectedInputInfo(currentCode);
  const stepInfo = getStepByStepPrompts(currentCode, stdin);

  const handleDirectInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim()) return;
    const newStdin = stdin ? `${stdin}\n${directInput}` : directInput;
    setStdin(newStdin);
    setDirectInput("");
    runCode();
  };

  const isMissingInputError = Boolean(
    error &&
      (/NoSuchElementException|EOFError|EOF when reading|End of file|stdin|Scanner/i.test(
        error
      ) ||
        (expectsInput && /Exception|Error|EOF/i.test(error)))
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
            {error && !isMissingInputError && <span className="w-2 h-2 rounded-full bg-error" />}
            {isMissingInputError && <span className="w-2 h-2 rounded-full bg-link animate-pulse" />}
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
                  <span className="text-mute">Active Input:</span>
                  <span className="text-ink font-mono truncate max-w-[200px]">
                    &quot;{stdin.replace(/\n/g, "  ")}&quot;
                  </span>
                </div>
                <button
                  onClick={() => setActiveOutputTab("stdin")}
                  className="flex items-center gap-1 text-link hover:underline shrink-0 text-caption font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit STDIN
                </button>
              </div>
            )}

            {isRunning ? (
              <div className="flex items-center gap-3 text-body-sm text-body py-4">
                <div className="w-4 h-4 border-2 border-hairline border-t-link rounded-full animate-spin" />
                <span>Executing code...</span>
              </div>
            ) : error ? (
              <div className="space-y-3">
                {output && (
                  <pre className="text-ink whitespace-pre-wrap break-words leading-relaxed">
                    {output}
                  </pre>
                )}

                {isMissingInputError ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-md bg-link/10 border border-link/30 text-link text-caption font-sans">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-link" />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-ink">
                          {stepInfo.activePrompt ? `Waiting for: "${stepInfo.activePrompt}"` : "Program is waiting for input"}
                        </span>
                        {stepInfo.totalPrompts > 0 && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-link/15 border border-link/30 text-link">
                            Step {stepInfo.currentStep} of {stepInfo.totalPrompts}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${inputInfo.badgeColor}`}>
                          {inputInfo.typeLabel}
                        </span>
                      </div>
                      <span className="text-body-sm">
                        Type input for <strong className="text-ink">{stepInfo.activePrompt || inputInfo.typeLabel}</strong> in the <strong className="font-mono bg-canvas border border-hairline px-1.5 py-0.5 rounded text-ink">&gt;</strong> prompt below and press <strong>Enter</strong> to proceed.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-error text-body-sm font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Execution Error</span>
                    </div>
                    <pre className="text-error whitespace-pre-wrap break-words leading-relaxed text-caption">
                      {error}
                    </pre>
                  </div>
                )}
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

            {/* Direct Interactive Console Input Line */}
            <form
              onSubmit={handleDirectInputSubmit}
              className="pt-3 border-t border-hairline flex items-center gap-2 font-sans"
            >
              <span className="text-link font-bold font-mono text-body-sm pl-1 shrink-0">
                {stepInfo.activePrompt ? `${stepInfo.activePrompt}` : ">"}
              </span>
              <input
                type="text"
                value={directInput}
                onChange={(e) => setDirectInput(e.target.value)}
                placeholder={
                  stepInfo.activePrompt
                    ? `Type ${stepInfo.activePrompt} & press Enter...`
                    : inputInfo.placeholder
                }
                className="flex-1 bg-canvas border border-hairline focus:border-link rounded-md px-3 py-1.5 text-ink text-body-sm font-mono placeholder:text-mute focus:outline-none transition-colors"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!directInput.trim() || isRunning}
                icon={<CornerDownLeft className="w-3.5 h-3.5" />}
              >
                Send & Run
              </Button>
            </form>
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
