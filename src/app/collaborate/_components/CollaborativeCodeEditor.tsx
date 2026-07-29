"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useUpdateMyPresence, useOthers } from "../../../../liveblocks.config";
import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG, defineMonacoThemes } from "@/lib/constants";
import type { Monaco } from "@monaco-editor/react";
import { FileCode, Code2 } from "lucide-react";
import useMounted from "@/hooks/useMounted";
import { MonacoBinding } from "@/lib/y-monaco";

interface CollaborativeCodeEditorProps {
  /** Current user info for awareness (cursor labels) */
  currentUser?: {
    name: string;
    color?: string;
  };
  /** Initial code to seed if Yjs document is empty */
  initialCode?: string;
  /** Callback when code changes (debounced) — for Convex persistence */
  onCodeChange?: (code: string) => void;
  /** Name of the participant to auto-follow cursor position */
  followedUserName?: string | null;
  /** Callback to stop following user cursor */
  onStopFollow?: () => void;
  /** Admin lock mode: presentation mode where non-admins are read-only */
  isLocked?: boolean;
  /** Whether local user is room Admin */
  isAdmin?: boolean;
}

const CURSOR_COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DD0E1",
  "#4DB6AC", "#81C784", "#AED581", "#FFD54F",
  "#FFB74D", "#FF8A65", "#A1887F", "#90A4AE",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export default function CollaborativeCodeEditor({
  currentUser,
  initialCode,
  onCodeChange,
  followedUserName,
  onStopFollow,
  isLocked,
  isAdmin,
}: CollaborativeCodeEditorProps) {
  const mounted = useMounted();
  const room = useRoom();
  const yProvider = useMemo(() => getYjsProviderForRoom(room), [room]);
  const { language, theme, fontSize, runCode, setEditor } = useCodeEditorStore();

  const [editorRef, setEditorRef] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monacoInstance, setMonacoInstance] = useState<any>(null);

  const currentLang =
    (mounted ? LANGUAGE_CONFIG[language] : null) || LANGUAGE_CONFIG.javascript;

  const updatePresence = useUpdateMyPresence();

  // Handle readOnly lock mode
  useEffect(() => {
    if (editorRef) {
      const isReadOnly = Boolean(isLocked && !isAdmin);
      editorRef.updateOptions({ readOnly: isReadOnly });
    }
  }, [editorRef, isLocked, isAdmin]);

  // Set up awareness with user info
  useEffect(() => {
    if (!currentUser || !yProvider) return;

    const color =
      currentUser.color ||
      CURSOR_COLORS[Math.abs(hashCode(currentUser.name)) % CURSOR_COLORS.length];

    // Defer awareness local state set to prevent updating other presence components during render
    const timeoutId = setTimeout(() => {
      yProvider.awareness.setLocalStateField("user", {
        name: currentUser.name,
        color,
        colorLight: color + "40", // 25% opacity version
      });

      updatePresence({
        user: {
          name: currentUser.name,
          color,
          colorLight: color + "40",
        },
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentUser, yProvider, updatePresence]);

  const others = useOthers();
  const bindingRef = useRef<MonacoBinding | null>(null);

  const onlineUserNames = useMemo(() => {
    const names = new Set<string>();
    others.forEach((o) => {
      const name =
        (o.presence as { user?: { name?: string } } | undefined)?.user?.name ||
        (o.info as { name?: string } | undefined)?.name;
      if (name) names.add(name);
    });
    return names;
  }, [others]);

  useEffect(() => {
    if (bindingRef.current) {
      bindingRef.current.setOnlineUserNames(onlineUserNames);
    }
  }, [onlineUserNames]);

  // Seed Yjs text with initialCode if yText is currently empty
  useEffect(() => {
    if (!yProvider || !initialCode) return;
    const yDoc = yProvider.getYDoc();
    const yText = yDoc.getText("monaco");

    if (yText.toString() === "") {
      yDoc.transact(() => {
        if (yText.toString() === "") {
          yText.insert(0, initialCode);
        }
      });
    }
  }, [yProvider, initialCode]);

  // Bind Yjs <-> Monaco editor
  useEffect(() => {
    let binding: MonacoBinding | undefined;

    if (editorRef && monacoInstance) {
      const yDoc = yProvider.getYDoc();
      const yText = yDoc.getText("monaco");

      if (yText.toString() === "" && initialCode) {
        yDoc.transact(() => {
          if (yText.toString() === "") {
            yText.insert(0, initialCode);
          }
        });
      }

      const model = editorRef.getModel();

      if (model) {
        binding = new MonacoBinding(
          yText,
          model,
          new Set([editorRef]),
          yProvider.awareness,
          monacoInstance
        );
        binding.setOnlineUserNames(onlineUserNames);
        binding.onCursorPositionChange = (userName, lineNumber) => {
          if (followedUserName && userName === followedUserName && editorRef) {
            editorRef.revealLineInCenter(lineNumber);
          }
        };
        bindingRef.current = binding;
      }

      // Debounced code change callback for Convex persistence
      let timeout: NodeJS.Timeout | null = null;
      const observer = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (onCodeChange) {
            onCodeChange(yText.toString());
          }
        }, 500);
      };
      yText.observe(observer);

      return () => {
        yText.unobserve(observer);
        if (timeout) clearTimeout(timeout);
        binding?.destroy();
        bindingRef.current = null;
      };
    }

    return () => {
      binding?.destroy();
      bindingRef.current = null;
    };
  }, [editorRef, monacoInstance, yProvider, initialCode, language, onCodeChange, onlineUserNames, followedUserName]);

  const handleEditorMount = useCallback(
    (monacoEditor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      defineMonacoThemes(monaco);
      setEditorRef(monacoEditor);
      setMonacoInstance(monaco);
      setEditor(monacoEditor as unknown as Monaco, true);

      // Ctrl+Enter to run code
      monacoEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          runCode();
        }
      );
    },
    [runCode, setEditor]
  );

  return (
    <div className="flex flex-col h-full bg-canvas relative">
      {/* Follow / Lock Banner Notification Alerts */}
      {followedUserName && (
        <div className="bg-link/20 border-b border-link/40 px-3 py-1 text-xs text-link font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            🎯 Following <strong className="font-bold">{followedUserName}</strong> cursor...
          </span>
          {onStopFollow && (
            <button
              onClick={onStopFollow}
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-link text-white hover:bg-link-hover transition-colors"
            >
              Stop Following
            </button>
          )}
        </div>
      )}

      {isLocked && !isAdmin && (
        <div className="bg-warning/15 border-b border-warning/30 px-3 py-1 text-xs text-warning font-medium flex items-center gap-1.5">
          🔒 Presentation Mode — Room is set to Read-Only by Admin
        </div>
      )}

      {/* Editor tab bar */}
      <div className="h-9 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between text-caption">
        <div className="flex items-center gap-2 px-3 py-1 bg-canvas border-t-2 border-t-link border-x border-hairline text-ink font-mono rounded-t-sm">
          <FileCode className="w-3.5 h-3.5 text-link" />
          <span>{currentLang.fileName}</span>
        </div>

        <div className="flex items-center gap-2 text-mute">
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-mono">{currentLang.monacoLanguage}</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={currentLang.monacoLanguage}
          defaultValue=""
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
            tabSize: 2,
            readOnly: Boolean(isLocked && !isAdmin),
            inlineSuggest: { enabled: true },
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true,
            snippetSuggestions: "inline",
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            wordBasedSuggestions: "allDocuments",
          }}
        />
      </div>
    </div>
  );
}
