"use client";

import { motion } from "framer-motion";

const CODE_LINES = [
  { indent: 0, tokens: [{ text: "function", color: "#ff7b72" }, { text: " ", color: "" }, { text: "fibonacci", color: "#d2a8ff" }, { text: "(", color: "#c9d1d9" }, { text: "n", color: "#ffa657" }, { text: ")", color: "#c9d1d9" }, { text: " {", color: "#c9d1d9" }] },
  { indent: 1, tokens: [{ text: "if", color: "#ff7b72" }, { text: " (n <= ", color: "#c9d1d9" }, { text: "1", color: "#79c0ff" }, { text: ") ", color: "#c9d1d9" }, { text: "return", color: "#ff7b72" }, { text: " n;", color: "#c9d1d9" }] },
  { indent: 1, tokens: [{ text: "return", color: "#ff7b72" }, { text: " ", color: "" }, { text: "fibonacci", color: "#d2a8ff" }, { text: "(n - ", color: "#c9d1d9" }, { text: "1", color: "#79c0ff" }, { text: ") + ", color: "#c9d1d9" }, { text: "fibonacci", color: "#d2a8ff" }, { text: "(n - ", color: "#c9d1d9" }, { text: "2", color: "#79c0ff" }, { text: ");", color: "#c9d1d9" }] },
  { indent: 0, tokens: [{ text: "}", color: "#c9d1d9" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ text: "// Print first 10 numbers", color: "#6e7681" }] },
  { indent: 0, tokens: [{ text: "for", color: "#ff7b72" }, { text: " (", color: "#c9d1d9" }, { text: "let", color: "#ff7b72" }, { text: " i = ", color: "#c9d1d9" }, { text: "0", color: "#79c0ff" }, { text: "; i < ", color: "#c9d1d9" }, { text: "10", color: "#79c0ff" }, { text: "; i++) {", color: "#c9d1d9" }] },
  { indent: 1, tokens: [{ text: "console", color: "#c9d1d9" }, { text: ".", color: "#c9d1d9" }, { text: "log", color: "#d2a8ff" }, { text: "(", color: "#c9d1d9" }, { text: "fibonacci", color: "#d2a8ff" }, { text: "(i));", color: "#c9d1d9" }] },
  { indent: 0, tokens: [{ text: "}", color: "#c9d1d9" }] },
];

const OUTPUT_LINES = ["0", "1", "1", "2", "3", "5", "8", "13", "21", "34"];

export default function ShowcaseBand() {
  return (
    <section className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-page-narrow mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="mono-label text-[#666666]">Experience</span>
          <h2 className="mt-3 text-display-lg text-white">
            A code editor that feels native.
          </h2>
          <p className="mt-3 text-body-md text-[#a1a1a1] max-w-lg mx-auto">
            Powered by Monaco — the same engine behind VS Code. Full
            IntelliSense, syntax highlighting, and instant execution.
          </p>
        </div>

        {/* Code editor mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-xl border border-[#2e2e2e] overflow-hidden shadow-level-4 max-w-3xl mx-auto"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#2e2e2e]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-2 text-[12px] font-mono text-[#6e7681]">
                fibonacci.js
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#3fb950]">
                ✓ 34ms
              </span>
            </div>
          </div>

          {/* Editor + Output split */}
          <div className="flex flex-col sm:flex-row">
            {/* Code panel */}
            <div className="flex-1 bg-[#0d1117] p-4 overflow-x-auto">
              <pre className="text-[13px] leading-[20px] font-mono">
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right text-[#6e7681] select-none mr-4 shrink-0">
                      {i + 1}
                    </span>
                    <span style={{ paddingLeft: `${line.indent * 20}px` }}>
                      {line.tokens.map((token, j) => (
                        <span key={j} style={{ color: token.color }}>
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            </div>

            {/* Output panel */}
            <div className="sm:w-48 bg-[#161b22] border-t sm:border-t-0 sm:border-l border-[#2e2e2e] p-4">
              <div className="text-[11px] font-mono text-[#6e7681] uppercase mb-3">
                Output
              </div>
              <pre className="text-[13px] leading-[20px] font-mono text-[#c9d1d9]">
                {OUTPUT_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                  >
                    {line}
                  </motion.div>
                ))}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
