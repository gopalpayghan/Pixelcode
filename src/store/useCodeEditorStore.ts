import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

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

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
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

      // Collaborative state
      isCollaborativeMode: false,
      currentRoomId: null,
      activeUsers: [],
      userCursors: new Map(),
      isReceivingRemoteChange: false,

      getCode: () => get().editor?.getValue() || "",

      setEditor: (editor: Monaco) => {
        const savedCode = localStorage.getItem(`editor-code-${get().language}`);
        if (savedCode) editor.setValue(savedCode);

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

      setLanguage: (language: string) => {
        // Save current language code before switching
        const currentCode = get().editor?.getValue();
        if (currentCode) {
          localStorage.setItem(`editor-code-${get().language}`, currentCode);
        }

        localStorage.setItem("editor-language", language);

        set({
          language,
          output: "",
          error: null,
        });
      },

      runCode: async () => {
        const { language, getCode } = get();
        const code = getCode();

        if (!code) {
          set({ error: "Please enter some code" });
          return;
        }

        set({ isRunning: true, error: null, output: "" });

        try {
          const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
          const response = await fetch(
            "https://emkc.org/api/v2/piston/execute",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files: [{ content: code }],
              }),
            }
          );

          const data = await response.json();

          console.log("data back from piston:", data);

          // handle API-level erros
          if (data.message) {
            set({
              error: data.message,
              executionResult: { code, output: "", error: data.message },
            });
            return;
          }

          // handle compilation errors
          if (data.compile && data.compile.code !== 0) {
            const error = data.compile.stderr || data.compile.output;
            set({
              error,
              executionResult: {
                code,
                output: "",
                error,
              },
            });
            return;
          }

          if (data.run && data.run.code !== 0) {
            const error = data.run.stderr || data.run.output;
            set({
              error,
              executionResult: {
                code,
                output: "",
                error,
              },
            });
            return;
          }

          // if we get here, execution was successful
          const output = data.run.output;

          set({
            output: output.trim(),
            error: null,
            executionResult: {
              code,
              output: output.trim(),
              error: null,
            },
          });
        } catch (error) {
          console.log("Error running code:", error);
          set({
            error: "Error running code",
            executionResult: { code, output: "", error: "Error running code" },
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
          (u) => u.id === user.id
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

          // Only update if the code is actually different
          if (currentCode !== code) {
            set({ isReceivingRemoteChange: true });

            // Preserve cursor position for better UX
            const position = editor.getPosition();
            const selection = editor.getSelection();

            editor.setValue(code);

            // Restore cursor position if possible
            if (position) {
              editor.setPosition(position);
            }
            if (selection) {
              editor.setSelection(selection);
            }

            // Immediately reset flag for instant responsiveness
            set({ isReceivingRemoteChange: false });
          }
        }
      },
    };
  }
);

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
