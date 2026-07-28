"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import NavigationHeader from "@/components/NavigationHeader";
import EditorTopBar from "@/app/editor/_components/EditorTopBar";
import CodePanel from "@/app/editor/_components/CodePanel";
import OutputPanel from "@/app/editor/_components/OutputPanel";
import StatusBar from "@/app/editor/_components/StatusBar";
import ChangeRequestPanel from "@/app/collaborate/_components/ChangeRequestPanel";
import SubmitChangesModal from "@/app/collaborate/_components/SubmitChangesModal";
import SideBySideDiff from "@/app/collaborate/_components/SideBySideDiff";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useSocket } from "@/components/providers/SocketProvider";
import { LANGUAGE_CONFIG } from "@/lib/constants";
import {
  Users,
  Copy,
  Check,
  LogOut,
  Circle,
  GitPullRequest,
  Shield,
  Send,
  Code2,
  Trash2,
  FileCode,
  Columns,
  Split,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function CollaborativeRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { user } = useAuthContext();
  const { socket, isConnected } = useSocket();

  const [copied, setCopied] = useState(false);
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [contributorViewMode, setContributorViewMode] = useState<
    "split" | "diff"
  >("split");
  const [draftCode, setDraftCode] = useState("");
  const { editor, setLanguage, runCode, language } = useCodeEditorStore();

  const isRemoteUpdatingRef = useRef(false);

  // ─── Convex queries & mutations ───
  const joinSessionMut = useMutation(api.collaborativeSessions.joinSession);
  const leaveSessionMut = useMutation(api.collaborativeSessions.leaveSession);
  const heartbeatMut = useMutation(api.collaborativeSessions.heartbeat);
  const createSessionMut = useMutation(api.collaborativeSessions.createSession);
  const deleteSessionMut = useMutation(api.collaborativeSessions.deleteSession);
  const updateSessionCodeMut = useMutation(
    api.collaborativeSessions.updateSessionCode,
  );
  const updateCursorPositionMut = useMutation(
    api.collaborativeSessions.updateCursorPosition,
  );

  const participants = useQuery(
    api.collaborativeSessions.getActiveParticipants,
    roomId ? { roomId } : "skip",
  );

  const roomAdmin = useQuery(
    api.collaborativeSessions.getRoomAdmin,
    roomId ? { roomId } : "skip",
  );

  const changeRequests = useQuery(
    api.collaborativeSessions.getChangeRequests,
    roomId ? { roomId } : "skip",
  );

  const session = useQuery(
    api.collaborativeSessions.getSessionByRoomId,
    roomId ? { roomId } : "skip",
  );

  const isAdmin = !!(user && roomAdmin && roomAdmin.hostUserId === user.userId);
  const pendingCount =
    changeRequests?.filter((cr) => cr.status === "pending").length ?? 0;

  // ─── Create session if first user (becomes admin) ───
  useEffect(() => {
    // roomAdmin is undefined while loading, null if no session exists
    if (!roomId || !user || roomAdmin === undefined) return;

    // Only create if no session exists yet
    if (roomAdmin === null) {
      createSessionMut({
        roomId,
        title: `Room ${roomId}`,
        language: language || "javascript",
        code: editor?.getValue() || "// Start coding here...\n",
        hostUserId: user.userId,
        hostUserName: user.name || "Anonymous Developer",
      }).catch(() => {
        // Session might already exist from another tab, ignore
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId, roomAdmin]);

  // ─── Initialize draft code for contributors ───
  useEffect(() => {
    if (!isAdmin && session?.code && !draftCode) {
      setDraftCode(session.code);
    }
  }, [isAdmin, session?.code, draftCode]);

  // ─── Participant tracking ───
  useEffect(() => {
    if (!roomId || !user) return;

    joinSessionMut({
      roomId,
      userId: user.userId,
      userName: user.name || "Anonymous",
      avatar: user.avatar,
    });

    return () => {
      leaveSessionMut({
        roomId,
        userId: user.userId,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId]);

  useEffect(() => {
    if (!roomId || !user) return;

    const interval = setInterval(() => {
      heartbeatMut({
        roomId,
        userId: user.userId,
      });
    }, 15_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId]);

  // ─── Socket.IO code sync (when available, admin only) ───
  useEffect(() => {
    if (!socket || !isConnected || !roomId || !user) return;

    socket.emit("join-room", {
      roomId,
      user: {
        id: user.userId,
        name: user.name || "Anonymous",
        avatar: user.avatar,
      },
    });

    socket.on("code-update", (data: { code: string; language: string }) => {
      if (editor && isAdmin) {
        const currentCode = editor.getValue();
        if (currentCode !== data.code) {
          isRemoteUpdatingRef.current = true;
          const pos = editor.getPosition();
          editor.setValue(data.code);
          if (pos) editor.setPosition(pos);
          isRemoteUpdatingRef.current = false;
        }
      }
    });

    socket.on("language-update", (data: { language: string }) => {
      setLanguage(data.language);
    });

    socket.on("code-execution", () => {
      toast("Partner ran the code!", { icon: "⚡" });
      runCode();
    });

    return () => {
      socket.off("code-update");
      socket.off("language-update");
      socket.off("code-execution");
    };
  }, [
    socket,
    isConnected,
    roomId,
    user,
    editor,
    setLanguage,
    runCode,
    isAdmin,
  ]);

  const isLanguageChangingRef = useRef(false);
  const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Track Admin live code typing and cursor position ───
  useEffect(() => {
    if (!editor || !isAdmin || !user || !roomId) return;

    // Code change listener
    const contentDisposable = editor.onDidChangeModelContent(() => {
      if (isRemoteUpdatingRef.current || isLanguageChangingRef.current) return;
      const code = editor.getValue();

      // Debounce Convex code updates to prevent re-render thrashing
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }

      codeUpdateTimeoutRef.current = setTimeout(() => {
        updateSessionCodeMut({ roomId, code });
      }, 300);

      if (socket && isConnected) {
        socket.emit("code-change", {
          roomId,
          code,
          language: useCodeEditorStore.getState().language,
        });
      }
    });

    // Cursor position listener
    const cursorDisposable = editor.onDidChangeCursorPosition(
      (e: { position: { lineNumber: number; column: number } }) => {
        if (e.position) {
          updateCursorPositionMut({
            roomId,
            userId: user.userId,
            cursorLine: e.position.lineNumber,
            cursorColumn: e.position.column,
          });

          if (socket && isConnected) {
            socket.emit("cursor-change", {
              roomId,
              position: {
                lineNumber: e.position.lineNumber,
                column: e.position.column,
              },
            });
          }
        }
      },
    );

    return () => {
      contentDisposable.dispose();
      cursorDisposable.dispose();
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }
    };
  }, [
    editor,
    isAdmin,
    user,
    roomId,
    socket,
    isConnected,
    updateSessionCodeMut,
    updateCursorPositionMut,
  ]);

  const copyRoomLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Room link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleLeave = useCallback(() => {
    router.push("/collaborate");
  }, [router]);

  const handleDeleteRoom = useCallback(async () => {
    if (!user || !roomId) return;
    if (
      window.confirm(
        "Are you sure you want to delete this room? All participants will be redirected.",
      )
    ) {
      try {
        await deleteSessionMut({ roomId, userId: user.userId });
        toast.success("Room session deleted");
        router.push("/collaborate");
      } catch {
        toast.error("Failed to delete room");
      }
    }
  }, [user, roomId, deleteSessionMut, router]);

  // Auto-redirect contributors if room is ended/deleted by Admin
  useEffect(() => {
    if (session === null && roomAdmin !== undefined) {
      toast("The room session has been ended by the Admin.", { icon: "ℹ️" });
      router.push("/collaborate");
    }
  }, [session, roomAdmin, router]);

  const prevSessionLangRef = useRef<string | null>(null);

  // ─── Sync Convex session language to local editor store for all users ───
  useEffect(() => {
    if (session?.language && session.language !== language) {
      prevSessionLangRef.current = session.language;
      isLanguageChangingRef.current = true;
      setLanguage(session.language, true);

      setTimeout(() => {
        isLanguageChangingRef.current = false;
      }, 500);
    }
  }, [session?.language, language, setLanguage]);

  // ─── Sync Admin language changes to Convex session & Socket ───
  useEffect(() => {
    if (
      isAdmin &&
      roomId &&
      language &&
      session &&
      session.language !== language &&
      prevSessionLangRef.current !== language
    ) {
      prevSessionLangRef.current = language;
      isLanguageChangingRef.current = true;

      updateSessionCodeMut({
        roomId,
        code: editor?.getValue() || session.code || "",
        language,
      });

      if (socket && isConnected) {
        socket.emit("language-change", { roomId, language });
      }

      setTimeout(() => {
        isLanguageChangingRef.current = false;
      }, 500);
    }
  }, [
    isAdmin,
    roomId,
    language,
    session,
    editor,
    socket,
    isConnected,
    updateSessionCodeMut,
  ]);

  const activeCount = participants?.length ?? 0;
  const currentSessionCode = session?.code || "";
  const adminParticipant = participants?.find(
    (p) => roomAdmin && p.userId === roomAdmin.hostUserId,
  );

  const adminLanguageId = session?.language || language || "javascript";
  const adminLangConfig =
    LANGUAGE_CONFIG[adminLanguageId] || LANGUAGE_CONFIG.javascript;

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />

      {/* Room toolbar */}
      <div className="h-12 px-4 bg-canvas-soft-2 border-b border-hairline flex items-center justify-between text-body-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Circle className="w-2.5 h-2.5 fill-success text-success animate-pulse" />
            <span className="font-mono text-ink font-semibold">{roomId}</span>
          </div>

          <span className="text-hairline">|</span>

          {/* Role badge */}
          {user && roomAdmin && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isAdmin
                  ? "bg-link/15 text-link border border-link/30"
                  : "bg-canvas-soft border border-hairline text-body"
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" />
                  Admin
                </>
              ) : (
                <>
                  <Code2 className="w-3 h-3" />
                  Contributor
                </>
              )}
            </div>
          )}

          <span className="text-hairline">|</span>

          {/* Active users with avatars */}
          <div className="flex items-center gap-2">
            {participants && participants.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {participants.slice(0, 5).map((p) => (
                  <div
                    key={p.userId}
                    className={`w-6 h-6 rounded-full font-semibold text-[10px] flex items-center justify-center uppercase border-2 border-canvas-soft-2 shrink-0 ${
                      roomAdmin && p.userId === roomAdmin.hostUserId
                        ? "bg-link/20 text-link ring-1 ring-link/40"
                        : "bg-link/15 text-link"
                    }`}
                    title={`${p.userName}${roomAdmin && p.userId === roomAdmin.hostUserId ? " (Admin)" : ""}`}
                  >
                    {p.userName.charAt(0)}
                  </div>
                ))}
                {participants.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-canvas-soft text-mute font-semibold text-[10px] flex items-center justify-center border-2 border-canvas-soft-2 shrink-0">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
            )}

            <Users className="w-3.5 h-3.5 text-mute" />
            <span className="text-caption text-body">
              {activeCount} Active {activeCount === 1 ? "User" : "Users"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Requests button (visible to both, but admin gets badge) */}
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReviewPanelOpen(true)}
              icon={<GitPullRequest className="w-3.5 h-3.5" />}
              className={pendingCount > 0 ? "border-warning text-warning" : ""}
            >
              Requests
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-bold tabular-nums">
                  {pendingCount}
                </span>
              )}
            </Button>
          )}

          {/* Submit changes button (contributors only) */}
          {!isAdmin && user && roomAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSubmitModalOpen(true)}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Changes
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={copyRoomLink}
            icon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          >
            {copied ? "Copied Link" : "Invite Partner"}
          </Button>

          {isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteRoom}
              icon={<Trash2 className="w-3.5 h-3.5 text-error" />}
              className="text-error hover:bg-error/10"
            >
              Delete Room
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              icon={<LogOut className="w-3.5 h-3.5 text-error" />}
              className="text-error hover:bg-error/10"
            >
              Leave Room
            </Button>
          )}
        </div>
      </div>

      <EditorTopBar />

      {/* Main editor area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-0 min-w-0 border-r border-hairline flex flex-col">
          {isAdmin ? (
            /* Admin: direct code editing */
            <CodePanel />
          ) : (
            /* Contributor: read-only admin code + draft editor */
            <>
              {/* Admin's code (read-only reference with live cursor, file name & language badge) */}
              <div className="flex-[2] min-h-0 flex flex-col border-b border-hairline">
                <div className="h-10 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-caption">
                      <Shield className="w-3.5 h-3.5 text-link" />
                      <span className="font-mono text-ink font-semibold">
                        Admin&apos;s Code
                      </span>
                    </div>

                    {/* Active File Name & Language Badge */}
                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-canvas border border-hairline font-mono text-caption text-ink">
                      <FileCode className="w-3.5 h-3.5 text-link" />
                      <span className="font-semibold">
                        {adminLangConfig.fileName}
                      </span>
                      <span className="text-hairline">|</span>
                      <div className="flex items-center gap-1 text-mute">
                        <img
                          src={adminLangConfig.logoPath}
                          alt=""
                          className="w-3.5 h-3.5 object-contain"
                        />
                        <span className="font-medium text-ink">
                          {adminLangConfig.label}
                        </span>
                      </div>
                    </div>
                    {/* View Mode Toggle: Split View vs Side-by-Side Diff */}
                    <div className="flex items-center p-0.5 rounded bg-canvas border border-hairline text-caption">
                      <button
                        onClick={() => setContributorViewMode("split")}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                          contributorViewMode === "split"
                            ? "bg-canvas-soft-2 text-ink font-medium"
                            : "text-mute hover:text-ink"
                        }`}
                        title="Split view"
                      >
                        <Split className="w-3 h-3" />
                        <span>Split</span>
                      </button>
                      <button
                        onClick={() => setContributorViewMode("diff")}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                          contributorViewMode === "diff"
                            ? "bg-canvas-soft-2 text-ink font-medium"
                            : "text-mute hover:text-ink"
                        }`}
                        title="Side-by-side diff view"
                      >
                        <Columns className="w-3 h-3" />
                        <span>Side-by-Side Diff</span>
                      </button>
                    </div>
                  </div>

                  {adminParticipant?.cursorLine && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-link/15 text-link font-mono text-[11px] font-medium border border-link/30 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-link animate-ping" />
                      <span>
                        {adminParticipant.userName} at Ln{" "}
                        {adminParticipant.cursorLine}, Col{" "}
                        {adminParticipant.cursorColumn || 1}
                      </span>
                    </div>
                  )}
                </div>

                {contributorViewMode === "diff" ? (
                  <div className="flex-1 min-h-0 p-3 bg-canvas">
                    <SideBySideDiff
                      originalCode={currentSessionCode}
                      proposedCode={draftCode}
                      originalTitle={`Admin Code (${adminLangConfig.fileName})`}
                      proposedTitle="Your Draft (Proposed Changes)"
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 p-3 overflow-auto bg-canvas font-mono text-code text-ink">
                    {(
                      currentSessionCode ||
                      "// Waiting for admin to write code..."
                    )
                      .split("\n")
                      .map((line, idx) => {
                        const lineNumber = idx + 1;
                        const isCursorLine =
                          adminParticipant?.cursorLine === lineNumber;
                        const col = adminParticipant?.cursorColumn || 0;

                        let lineText = line;
                        if (isCursorLine && col > 0 && col <= line.length + 1) {
                          const before = line.slice(0, col - 1);
                          const after = line.slice(col - 1);
                          lineText = before + "│" + after;
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 px-2 py-0.5 rounded transition-colors ${
                              isCursorLine
                                ? "bg-link/15 border-l-2 border-link text-ink font-semibold"
                                : "text-body hover:bg-canvas-soft-2/50"
                            }`}
                          >
                            <span className="w-7 text-right text-mute/50 text-[11px] select-none shrink-0 font-mono">
                              {lineNumber}
                            </span>
                            <span className="whitespace-pre-wrap break-all leading-relaxed flex-1">
                              {lineText || " "}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Draft editor */}
              <div className="flex-[3] min-h-0 flex flex-col">
                <div className="h-10 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2 text-caption">
                    <Code2 className="w-3.5 h-3.5 text-success" />
                    <span className="font-mono text-ink font-medium text-body-sm">
                      Your Draft
                    </span>
                    <span className="hidden sm:inline text-mute">
                      — edit here & submit to admin for review
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setDraftCode(currentSessionCode);
                        toast.success("Draft reset to admin's current code");
                      }}
                      className="text-caption text-mute hover:text-ink transition-colors"
                    >
                      Reset to Admin&apos;s Code
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsSubmitModalOpen(true)}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Request to Admin
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <textarea
                    value={draftCode}
                    onChange={(e) => setDraftCode(e.target.value)}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full p-4 bg-canvas text-ink font-mono text-code resize-none focus:outline-none leading-relaxed"
                    placeholder="Type your code changes here, then click 'Send Request to Admin'..."
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:w-[420px] min-h-0 flex flex-col border-t lg:border-t-0 border-hairline">
          <OutputPanel />
        </div>
      </div>

      <StatusBar />

      {/* Modals & Panels */}
      {isAdmin && (
        <ChangeRequestPanel
          isOpen={isReviewPanelOpen}
          onClose={() => setIsReviewPanelOpen(false)}
          roomId={roomId}
          adminName={user?.name || "Admin"}
        />
      )}

      {!isAdmin && user && (
        <SubmitChangesModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          roomId={roomId}
          authorUserId={user.userId}
          authorUserName={user.name || "Anonymous"}
          originalCode={currentSessionCode}
          proposedCode={draftCode}
          language={language || "javascript"}
        />
      )}
    </div>
  );
}
