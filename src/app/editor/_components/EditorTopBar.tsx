"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG, THEMES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Play, Share2, Terminal, Sliders, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import useMounted from "@/hooks/useMounted";

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

  const currentLang = (mounted ? LANGUAGE_CONFIG[language] : null) || LANGUAGE_CONFIG.javascript;
  const currentThemeObj = (mounted ? THEMES.find((t) => t.id === theme) : null) || THEMES[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Editor URL copied to clipboard!");
  };

  return (
    <div className="h-14 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between gap-2 overflow-x-auto">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-canvas border border-hairline hover:border-hairline-strong text-body-sm text-ink transition-colors"
          >
            <img
              src={currentLang.logoPath}
              alt=""
              width={16}
              height={16}
              className="object-contain"
            />
            <span className="font-medium">{currentLang.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-mute" />
          </button>

          {isLangOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 py-1 bg-canvas-elevated border border-hairline rounded-lg shadow-level-4 z-50 animate-scale-in">
              {Object.values(LANGUAGE_CONFIG).map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-body-sm text-left hover:bg-canvas-soft-2 transition-colors ${
                    language === lang.id ? "text-link font-medium" : "text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={lang.logoPath}
                      alt=""
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                    <span>{lang.label}</span>
                  </div>
                  {language === lang.id && <Check className="w-3.5 h-3.5 text-link" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-canvas border border-hairline hover:border-hairline-strong text-body-sm text-ink transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-hairline"
              style={{ backgroundColor: currentThemeObj.color }}
            />
            <span className="font-medium">{currentThemeObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-mute" />
          </button>

          {isThemeOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 py-1 bg-canvas-elevated border border-hairline rounded-lg shadow-level-4 z-50 animate-scale-in">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-body-sm text-left hover:bg-canvas-soft-2 transition-colors ${
                    theme === t.id ? "text-link font-medium" : "text-ink"
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
          <span>{fontSize}px</span>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
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
          Share
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
  );
}
