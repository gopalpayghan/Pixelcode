"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";

const POPULAR_LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: ".js", desc: "V8 Engine • ES2024" },
  { id: "typescript", name: "TypeScript", ext: ".ts", desc: "Strict Types • v5.x" },
  { id: "python", name: "Python", ext: ".py", desc: "Python 3.12 • Data & AI" },
  { id: "java", name: "Java", ext: ".java", desc: "OpenJDK 21 • OOP" },
  { id: "cpp", name: "C++", ext: ".cpp", desc: "GCC 13 • Modern C++20" },
  { id: "rust", name: "Rust", ext: ".rs", desc: "Rustc 1.75 • Memory Safe" },
  { id: "go", name: "Go", ext: ".go", desc: "Go 1.22 • High Concurrency" },
  { id: "csharp", name: "C#", ext: ".cs", desc: ".NET 8.0 • Cross-platform" },
];

export default function LanguageGrid() {
  const { user } = useAuthContext();

  const getEditorUrl = (langId: string) => {
    if (user) {
      return `/editor?lang=${langId}`;
    }
    return `/sign-in?redirect=${encodeURIComponent(`/editor?lang=${langId}`)}`;
  };

  return (
    <section className="py-20 border-t border-hairline bg-canvas relative">
      <div className="max-w-page mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="mono-label text-mute inline-flex items-center gap-1.5 mb-2">
              <Code2 className="w-3.5 h-3.5 text-link" />
              Supported Toolchains
            </span>
            <h2 className="text-display-md text-ink">
              Choose your language. Start building.
            </h2>
          </div>
          <Link
            href={user ? "/editor" : "/sign-in?redirect=/editor"}
            className="text-body-sm text-link hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>View all in editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_LANGUAGES.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={getEditorUrl(lang.id)}
                prefetch={true}
                className="group flex items-center gap-3 p-3 rounded-lg bg-canvas border border-hairline shadow-level-1 hover:shadow-level-3 hover:border-hairline-strong transition-all duration-200"
              >
                <div className="shrink-0 w-8 h-8 rounded-md bg-canvas-soft-2 flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/${lang.id}.png`}
                    alt={`${lang.name} logo`}
                    width={20}
                    height={20}
                    className="object-contain transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-semibold text-ink group-hover:text-link transition-colors truncate">
                      {lang.name}
                    </span>
                    <span className="text-caption font-mono text-mute">{lang.ext}</span>
                  </div>
                  <p className="text-caption text-mute truncate mt-0.5">{lang.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
