import { CodeEditorState } from "./../types/index";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";
import { LANGUAGE_CONFIG } from "@/lib/constants";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  cursor?: {
    lineNumber: number;
    column: number;
  } | null;
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  } | null;
}

interface CollaborativeState {
  isCollaborativeMode: boolean;
  currentRoomId: string | null;
  activeUsers: User[];
  userCursors: Map<string, User>;
  isReceivingRemoteChange: boolean;
}

interface EnhancedCodeEditorState extends CodeEditorState, CollaborativeState {
  // STDIN & Output Tab support
  stdin: string;
  setStdin: (stdin: string) => void;
  activeOutputTab: "console" | "stdin";
  setActiveOutputTab: (tab: "console" | "stdin") => void;

  // Collaborative methods
  setCollaborativeMode: (enabled: boolean) => void;
  setCurrentRoomId: (roomId: string | null) => void;
  setActiveUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, cursor: User) => void;
  setReceivingRemoteChange: (receiving: boolean) => void;
  updateCodeFromRemote: (code: string) => void;
}

const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  go: 60,
  rust: 73,
  cpp: 54,
  csharp: 51,
  ruby: 72,
  swift: 83,
};

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<EnhancedCodeEditorState>(
  (set, get) => {
    const initialState = getInitialState();

    return {
      ...initialState,
      output: "",
      isRunning: false,
      error: null,
      editor: null,
      executionResult: null,

      // STDIN & Output Tab State
      stdin: "",
      setStdin: (stdin: string) => set({ stdin }),
      activeOutputTab: "console",
      setActiveOutputTab: (activeOutputTab: "console" | "stdin") =>
        set({ activeOutputTab }),

      // Collaborative state
      isCollaborativeMode: false,
      currentRoomId: null,
      activeUsers: [],
      userCursors: new Map(),
      isReceivingRemoteChange: false,

      getCode: () => get().editor?.getValue() || "",

      setEditor: (editor: Monaco, preserveValue = false) => {
        if (!preserveValue) {
          let savedCode = localStorage.getItem(`editor-code-${get().language}`);
          if (savedCode && (savedCode.includes("Hello") || savedCode.includes("Playground"))) {
            localStorage.removeItem(`editor-code-${get().language}`);
            savedCode = null;
          }
          const defaultCode =
            LANGUAGE_CONFIG[get().language]?.defaultCode || "";
          editor.setValue(savedCode || defaultCode);
        }

        set({ editor });
      },

      setTheme: (theme: string) => {
        localStorage.setItem("editor-theme", theme);
        set({ theme });
      },

      setFontSize: (fontSize: number) => {
        localStorage.setItem("editor-font-size", fontSize.toString());
        set({ fontSize });
      },

      setLanguage: (language: string, preserveCode = false) => {
        if (!preserveCode) {
          const currentCode = get().editor?.getValue();
          if (currentCode) {
            localStorage.setItem(`editor-code-${get().language}`, currentCode);
          }

          let savedCode = localStorage.getItem(`editor-code-${language}`);
          if (savedCode && (savedCode.includes("Hello") || savedCode.includes("Playground"))) {
            localStorage.removeItem(`editor-code-${language}`);
            savedCode = null;
          }
          const defaultCode =
            LANGUAGE_CONFIG[language]?.defaultCode || "";
          const newCode = savedCode || defaultCode;

          if (get().editor) {
            get().editor.setValue(newCode);
          }
        }

        localStorage.setItem("editor-language", language);

        set({
          language,
          output: "",
          error: null,
          stdin: "",
          isRunning: false,
          activeOutputTab: "console",
        });
      },

      runCode: async () => {
        const { language, getCode, stdin } = get();
        const code = getCode();

        if (!code) {
          set({ error: "Please enter some code" });
          return;
        }

        set({
          isRunning: true,
          error: null,
          output: "",
          activeOutputTab: "console",
        });

        try {
          const languageId = JUDGE0_LANGUAGE_MAP[language] || 63;

          const response = await fetch(
            "https://ce.judge0.com/submissions?wait=true",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language_id: languageId,
                source_code: code,
                stdin: stdin || "",
              }),
            },
          );

          const data = await response.json();

          if (data.status && data.status.id !== 3) {
            const errorMsg =
              data.compile_output ||
              data.stderr ||
              data.message ||
              data.status.description ||
              "Execution Error";

            set({
              error: errorMsg.trim(),
              executionResult: { code, output: "", error: errorMsg.trim() },
            });
            return;
          }

          if (data.stderr) {
            set({
              error: data.stderr.trim(),
              executionResult: { code, output: "", error: data.stderr.trim() },
            });
            return;
          }

          const outputResult = data.stdout
            ? data.stdout.trim()
            : "Program executed successfully with no output.";

          set({
            output: outputResult,
            error: null,
            executionResult: {
              code,
              output: outputResult,
              error: null,
            },
          });
        } catch (error) {
          if (language === "javascript") {
            try {
              const logs: string[] = [];
              const customConsole = {
                log: (...args: unknown[]) =>
                  logs.push(
                    args
                      .map((a) =>
                        typeof a === "object"
                          ? JSON.stringify(a, null, 2)
                          : String(a),
                      )
                      .join(" "),
                  ),
                error: (...args: unknown[]) =>
                  logs.push(
                    "Error: " +
                      args
                        .map((a) =>
                          typeof a === "object"
                            ? JSON.stringify(a, null, 2)
                            : String(a),
                        )
                        .join(" "),
                  ),
                warn: (...args: unknown[]) =>
                  logs.push(
                    "Warning: " +
                      args
                        .map((a) =>
                          typeof a === "object"
                            ? JSON.stringify(a, null, 2)
                            : String(a),
                        )
                        .join(" "),
                  ),
              };

              const runFn = new Function("console", "stdin", code);
              runFn(customConsole, stdin);

              const clientOutput =
                logs.join("\n") || "Program executed successfully.";
              set({
                output: clientOutput,
                error: null,
                executionResult: { code, output: clientOutput, error: null },
              });
              return;
            } catch (jsError: unknown) {
              const errMsg =
                jsError instanceof Error
                  ? jsError.message
                  : "Error running code";
              set({
                error: errMsg,
                executionResult: { code, output: "", error: errMsg },
              });
              return;
            }
          }

          console.log("Error running code:", error);
          set({
            error: "Error running code. Please check your internet connection.",
            executionResult: {
              code,
              output: "",
              error:
                "Error running code. Please check your internet connection.",
            },
          });
        } finally {
          set({ isRunning: false });
        }
      },

      // Collaborative methods
      setCollaborativeMode: (enabled: boolean) => {
        set({ isCollaborativeMode: enabled });
      },

      setCurrentRoomId: (roomId: string | null) => {
        set({ currentRoomId: roomId });
      },

      setActiveUsers: (users: User[]) => {
        set({ activeUsers: users });
      },

      addUser: (user: User) => {
        const { activeUsers } = get();
        const existingUserIndex = activeUsers.findIndex(
          (u) => u.id === user.id,
        );

        if (existingUserIndex >= 0) {
          const updatedUsers = [...activeUsers];
          updatedUsers[existingUserIndex] = user;
          set({ activeUsers: updatedUsers });
        } else {
          set({ activeUsers: [...activeUsers, user] });
        }
      },

      removeUser: (userId: string) => {
        const { activeUsers, userCursors } = get();
        const updatedUsers = activeUsers.filter((user) => user.id !== userId);
        const updatedCursors = new Map(userCursors);
        updatedCursors.delete(userId);

        set({
          activeUsers: updatedUsers,
          userCursors: updatedCursors,
        });
      },

      updateUserCursor: (userId: string, cursor: User) => {
        const { userCursors } = get();
        const updatedCursors = new Map(userCursors);
        updatedCursors.set(userId, cursor);

        set({ userCursors: updatedCursors });
      },

      setReceivingRemoteChange: (receiving: boolean) => {
        set({ isReceivingRemoteChange: receiving });
      },

      updateCodeFromRemote: (code: string) => {
        const { editor } = get();
        if (editor) {
          const currentCode = editor.getValue();

          if (currentCode !== code) {
            set({ isReceivingRemoteChange: true });

            const position = editor.getPosition();
            const selection = editor.getSelection();

            editor.setValue(code);

            if (position) {
              editor.setPosition(position);
            }
            if (selection) {
              editor.setSelection(selection);
            }

            set({ isReceivingRemoteChange: false });
          }
        }
      },
    };
  },
);

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
