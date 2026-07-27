"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LANGUAGE_CONFIG } from "@/lib/constants";

const POPULAR_LANGUAGES = [
  "javascript",
  "python",
  "java",
  "typescript",
  "cpp",
  "go",
  "rust",
  "csharp",
  "ruby",
  "swift",
];

export default function LanguageGrid() {
  const languages = POPULAR_LANGUAGES.map((id) => LANGUAGE_CONFIG[id]).filter(
    Boolean
  );

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-page-narrow mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="mono-label text-mute">Languages</span>
          <h2 className="mt-3 text-display-lg text-ink">
            Pick your language.
          </h2>
          <p className="mt-3 text-body-md text-body max-w-md mx-auto">
            Execute code in 10+ programming languages, powered by the
            Piston runtime engine.
          </p>
        </div>

        {/* Language cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={`/editor?lang=${lang.id}`}
                className="group flex items-center gap-3 p-3 rounded-lg bg-canvas border border-hairline shadow-level-1 hover:shadow-level-3 hover:border-hairline-strong transition-all duration-200"
              >
                <div className="shrink-0 w-8 h-8 rounded-md bg-canvas-soft-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={lang.logoPath}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-body-sm font-medium text-ink truncate group-hover:text-link transition-colors">
                  {lang.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
