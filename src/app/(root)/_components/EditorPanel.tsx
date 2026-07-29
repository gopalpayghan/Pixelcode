"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  RotateCcwIcon,
  ShareIcon,
  TypeIcon,
  UsersIcon,
  DownloadIcon,
} from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import { useSocket } from "@/components/providers/SocketProvider";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function EditorPanel() {
  const { user } = useAuthContext();
  const isSignedIn = !!user;
  const searchParams = useSearchParams();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    isCollaborativeMode,
    setCollaborativeMode,
    currentRoomId,
    setCurrentRoomId,
    activeUsers,
    setActiveUsers,
    addUser,
    removeUser,
    updateUserCursor,
    isReceivingRemoteChange,
    updateCodeFromRemote,
  } = useCodeEditorStore();

  const {
    socket,
    isConnected,
    joinRoom,
    emitCodeChange,
  } = useSocket();

  const mounted = useMounted();

  useEffect(() => {
    const roomId = searchParams?.get("room");
    if (roomId) {
      setCollaborativeMode(true);
      setCurrentRoomId(roomId);
      if (isConnected) {
        joinRoom(roomId);
      }
    }
  }, [
    searchParams,
    isConnected,
    joinRoom,
    setCollaborativeMode,
    setCurrentRoomId,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUsers = (
      users: Array<{
        id: string;
        name: string;
        email?: string;
        avatar?: string;
      }>
    ) => {
      setActiveUsers(users);
    };

    const handleUserJoined = (userObj: {
      id: string;
      name: string;
      email?: string;
      avatar?: string;
    }) => {
      addUser(userObj);
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      removeUser(userId);
    };

    const handleCodeUpdate = ({
      code,
      userId,
    }: {
      code: string;
      userId: string;
    }) => {
      if (userId !== socket.id) {
        updateCodeFromRemote(code);
      }
    };

    const handleCursorUpdate = ({
      userId,
      position,
      selection,
      user: remoteUser,
    }: {
      userId: string;
      position: unknown;
      selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
      user: { id: string; name: string; email?: string; avatar?: string };
    }) => {
      if (userId !== socket.id) {
        const cursor = position as { lineNumber: number; column: number; } | null | undefined;
        updateUserCursor(userId, { ...remoteUser, cursor, selection });
      }
    };

    const handleLanguageUpdate = ({
      language: newLanguage,
      userId,
    }: {
      language: string;
      userId: string;
    }) => {
      if (
        userId !== socket.id &&
        useCodeEditorStore.getState().language !== newLanguage
      ) {
        useCodeEditorStore.getState().setLanguage(newLanguage);
      }
    };

    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("code-update", handleCodeUpdate);
    socket.on("cursor-update", handleCursorUpdate);
    socket.on("language-update", handleLanguageUpdate);

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("code-update", handleCodeUpdate);
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("language-update", handleLanguageUpdate);
    };
  }, [
    socket,
    setActiveUsers,
    addUser,
    removeUser,
    updateUserCursor,
    updateCodeFromRemote,
  ]);

  useEffect(() => {
    let savedCode = localStorage.getItem(`editor-code-${language}`);
    if (
      savedCode &&
      (savedCode.includes("languageName") ||
        savedCode.includes("SwiftUI") ||
        savedCode.includes("version = 6.1") ||
        savedCode.includes("Hello") ||
        savedCode.includes("Playground"))
    ) {
      localStorage.removeItem(`editor-code-${language}`);
      savedCode = null;
    }
    const newCode = savedCode || LANGUAGE_CONFIG[language]?.defaultCode || "";
    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      localStorage.setItem(`editor-code-${language}`, value);

      if (
        isCollaborativeMode &&
        currentRoomId &&
        !isReceivingRemoteChange &&
        isConnected &&
        socket
      ) {
        emitCodeChange(currentRoomId, value, language);
      }
    }
  };

  const handleStartCollaboration = () => {
    const roomId = Math.random().toString(36).substring(7);
    const collaborativeUrl = `${window.location.origin}?room=${roomId}`;

    navigator.clipboard
      .writeText(collaborativeUrl)
      .then(() => {
        toast.success(
          "Room created! Link copied to clipboard. Share it with your team members.",
          {
            duration: 5000,
            icon: "🎉",
          }
        );
      })
      .catch(() => {
        toast.success(`Room created! Share this link: ${collaborativeUrl}`, {
          duration: 6000,
          icon: "🎉",
        });
      });

    setCollaborativeMode(true);
    setCurrentRoomId(roomId);

    if (isConnected && socket) {
      joinRoom(roomId);
    } else {
      const checkConnection = setInterval(() => {
        if (isConnected && socket) {
          joinRoom(roomId);
          clearInterval(checkConnection);
        }
      }, 50);

      setTimeout(() => clearInterval(checkConnection), 3000);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  const handleDownloadCode = () => {
    if (!editor) return;

    const code = editor.getValue();
    const languageConfig = LANGUAGE_CONFIG[language];
    const fileName = languageConfig.fileName;

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      {isCollaborativeMode && activeUsers.length > 0 && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[#1e1e2e]/90 backdrop-blur rounded-lg p-2 ring-1 ring-white/5">
          <UsersIcon className="size-4 text-blue-400" />
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((u, index) => (
              <div
                key={u.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-[#1e1e2e] flex items-center justify-center text-xs font-medium text-white"
                title={u.name}
                style={{ zIndex: 10 - index }}
              >
                {u.avatar ? (
                  <Image
                    src={u.avatar}
                    alt={u.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  u.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-500 ring-2 ring-[#1e1e2e] flex items-center justify-center text-xs font-medium text-white">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {activeUsers.length} online
          </span>
        </div>
      )}
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + language + ".png"}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                Write and execute your code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>

            {isSignedIn && (
              <>
                {!isCollaborativeMode ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartCollaboration}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 opacity-90 hover:opacity-100 transition-opacity"
                    title="Start collaborative session"
                  >
                    <UsersIcon className="size-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Collaborate
                    </span>
                  </motion.button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 ring-1 ring-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">
                      Live
                    </span>
                  </div>
                )}
              </>
            )}

            {isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadCode}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
                 from-purple-500 to-purple-600 opacity-90 hover:opacity-100 transition-opacity"
                title={`Download as ${LANGUAGE_CONFIG[language].fileName}`}
              >
                <DownloadIcon className="size-4 text-white" />
                <span className="text-sm font-medium text-white">Download</span>
              </motion.button>
            )}

            {isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsShareDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
                 from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
              >
                <ShareIcon className="size-4 text-white" />
                <span className="text-sm font-medium text-white ">Share</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          <Editor
            height="600px"
            language={LANGUAGE_CONFIG[language].monacoLanguage}
            onChange={handleEditorChange}
            theme={theme}
            beforeMount={defineMonacoThemes}
            onMount={(editorObj) => setEditor(editorObj)}
            options={{
              minimap: { enabled: false },
              fontSize,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              renderWhitespace: "selection",
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
              fontLigatures: true,
              cursorBlinking: "smooth",
              smoothScrolling: true,
              contextmenu: true,
              renderLineHighlight: "all",
              lineHeight: 1.6,
              letterSpacing: 0.5,
              roundedSelection: true,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              quickSuggestions: { other: true, comments: true, strings: true },
              parameterHints: { enabled: true },
              suggestOnTriggerCharacters: true,
              inlineSuggest: { enabled: true },
              snippetSuggestions: "inline",
              acceptSuggestionOnEnter: "on",
              tabCompletion: "on",
              wordBasedSuggestions: "allDocuments",
              fastScrollSensitivity: 5,
              mouseWheelScrollSensitivity: 1,
            }}
          />
        </div>
      </div>
      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
    </div>
  );
}
export default EditorPanel;
