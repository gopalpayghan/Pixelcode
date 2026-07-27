"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG, THEMES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Play, Share2, Terminal, Sliders, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import useMounted from "@/hooks/useMounted";
import ShareSnippetModal from "./ShareSnippetModal";

export default function EditorTopBar() {
  const mounted = useMounted();
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    runCode,
    isRunning,
    stdin,
    activeOutputTab,
    setActiveOutputTab,
  } = useCodeEditorStore();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const currentLang = (mounted ? LANGUAGE_CONFIG[language] : null) || LANGUAGE_CONFIG.javascript;
  const currentThemeObj = (mounted ? THEMES.find((t) => t.id === theme) : null) || THEMES[0];
  const currentFontSize = mounted ? fontSize : 16;

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="h-14 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-canvas border border-hairline hover:border-hairline-strong text-body-sm font-medium text-ink transition-colors"
            >
              <img
                src={currentLang.logoPath}
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>{currentLang.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-mute ml-1" />
            </button>

            {isLangOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 py-1 bg-canvas-elevated border border-hairline rounded-lg shadow-level-4 z-50 animate-scale-in max-h-64 overflow-y-auto">
                {Object.values(LANGUAGE_CONFIG).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-body-sm hover:bg-canvas-soft-2 transition-colors ${
                      language === lang.id ? "text-ink bg-canvas-soft font-medium" : "text-body"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={lang.logoPath}
                        alt=""
                        className="w-4 h-4 object-contain"
                      />
                      <span>{lang.label}</span>
                    </div>
                    {language === lang.id && <Check className="w-3.5 h-3.5 text-link" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme selector */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-canvas border border-hairline hover:border-hairline-strong text-body-sm font-medium text-ink transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full border border-hairline"
                style={{ backgroundColor: currentThemeObj.color }}
              />
              <span>{currentThemeObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-mute ml-1" />
            </button>

            {isThemeOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 py-1 bg-canvas-elevated border border-hairline rounded-lg shadow-level-4 z-50 animate-scale-in">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-body-sm hover:bg-canvas-soft-2 transition-colors ${
                      theme === t.id ? "text-ink bg-canvas-soft font-medium" : "text-body"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-hairline"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-link" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-canvas border border-hairline text-caption text-body">
            <Sliders className="w-3.5 h-3.5 text-mute" />
            <span>{currentFontSize}px</span>
            <input
              type="range"
              min="12"
              max="24"
              value={currentFontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 h-1 accent-link cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeOutputTab === "stdin" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveOutputTab(activeOutputTab === "stdin" ? "console" : "stdin")}
            icon={<Terminal className="w-3.5 h-3.5" />}
            className={activeOutputTab === "stdin" || stdin ? "border-link text-link" : ""}
          >
            STDIN {stdin ? "(Active)" : ""}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={<Share2 className="w-3.5 h-3.5" />}
          >
            Share Snippet
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={isRunning}
            onClick={runCode}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Run (Ctrl+Enter)
          </Button>
        </div>
      </div>

      <ShareSnippetModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}
