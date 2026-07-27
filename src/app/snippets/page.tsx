"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import SnippetsPageSkeleton from "./_components/SnippetsPageSkeleton";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { AnimatePresence } from "framer-motion";
import { BookOpen, Code, Search, X } from "lucide-react";
import SnippetCard from "./_components/SnippetCard";

function SnippetsPage() {
  const snippets = useQuery(api.snippets.getSnippets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  if (snippets === undefined) {
    return (
      <div className="min-h-screen bg-canvas">
        <NavigationHeader />
        <SnippetsPageSkeleton />
      </div>
    );
  }

  const languages = Array.from(new Set(snippets.map((s) => s.language)));

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />

        <main className="max-w-page mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="mono-label text-mute flex items-center justify-center gap-1.5 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-link" />
              Community Library
            </span>
            <h1 className="text-display-lg sm:text-display-xl text-ink text-balance">
              Discover & share code snippets.
            </h1>
            <p className="mt-3 text-body-md text-body">
              Explore public code snippets created by developers around the world.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets by title, language, or author..."
                className="w-full h-11 pl-10 pr-4 bg-canvas-soft border border-hairline hover:border-hairline-strong focus:border-link rounded-lg text-ink placeholder:text-mute font-sans text-body-sm transition-all focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-caption text-mute mr-1">Filter:</span>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang === selectedLanguage ? null : lang)}
                  className={`
                    px-3 py-1 rounded-full text-caption font-medium transition-all duration-200 flex items-center gap-1.5
                    ${
                      selectedLanguage === lang
                        ? "bg-primary text-primary-foreground shadow-level-2"
                        : "bg-canvas-soft border border-hairline text-body hover:text-ink hover:border-hairline-strong"
                    }
                  `}
                >
                  <img src={`/${lang}.png`} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="capitalize">{lang}</span>
                </button>
              ))}

              {selectedLanguage && (
                <button
                  onClick={() => setSelectedLanguage(null)}
                  className="flex items-center gap-1 px-2.5 py-1 text-caption text-mute hover:text-ink transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}

              <span className="ml-auto text-caption text-mute">
                {filteredSnippets.length} {filteredSnippets.length === 1 ? "snippet" : "snippets"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredSnippets.map((snippet) => (
                <SnippetCard key={snippet._id} snippet={snippet} />
              ))}
            </AnimatePresence>
          </div>

          {filteredSnippets.length === 0 && (
            <div className="text-center py-20 border border-hairline rounded-xl bg-canvas-soft max-w-md mx-auto">
              <Code className="w-8 h-8 text-mute mx-auto mb-3" />
              <h3 className="text-body-md font-semibold text-ink mb-1">No snippets found</h3>
              <p className="text-body-sm text-mute mb-4">
                Try adjusting your search criteria or clear your active filters.
              </p>
              {(searchQuery || selectedLanguage) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLanguage(null);
                  }}
                  className="px-4 py-2 text-body-sm bg-canvas border border-hairline hover:border-hairline-strong text-ink rounded-md transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default SnippetsPage;
