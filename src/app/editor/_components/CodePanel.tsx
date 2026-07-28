"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG, defineMonacoThemes } from "@/lib/constants";
import type { Monaco, OnMount } from "@monaco-editor/react";
import { Code2, FileCode } from "lucide-react";
import dynamic from "next/dynamic";
import useMounted from "@/hooks/useMounted";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-canvas text-caption text-mute font-mono">
      <div className="w-4 h-4 border-2 border-hairline border-t-link rounded-full animate-spin mr-2" />
      Loading Editor...
    </div>
  ),
});

export default function CodePanel() {
  const mounted = useMounted();
  const { language, theme, fontSize, setEditor, runCode } =
    useCodeEditorStore();
  const currentLang =
    (mounted ? LANGUAGE_CONFIG[language] : null) || LANGUAGE_CONFIG.javascript;

  const handleEditorMount: OnMount = (editor, monaco: Monaco) => {
    defineMonacoThemes(monaco);
    setEditor(editor as unknown as Monaco);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });
  };

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="h-9 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between text-caption">
        <div className="flex items-center gap-2 px-3 py-1 bg-canvas border-t-2 border-link border-x border-hairline text-ink font-mono rounded-t-sm">
          <FileCode className="w-3.5 h-3.5 text-link" />
          <span>{currentLang.fileName}</span>
        </div>

        <div className="flex items-center gap-2 text-mute">
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-mono">{currentLang.monacoLanguage}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={currentLang.monacoLanguage}
          defaultValue={currentLang.defaultCode}
          theme={theme}
          onMount={handleEditorMount}
          options={{
            fontSize: fontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderWhitespace: "selection",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontLigatures: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            lineNumbersMinChars: 3,
          }}
        />
      </div>
    </div>
  );
}
