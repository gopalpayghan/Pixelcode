"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ClientSideSuspense } from "@liveblocks/react";
import NavigationHeader from "@/components/NavigationHeader";
import EditorTopBar from "@/app/editor/_components/EditorTopBar";
import OutputPanel from "@/app/editor/_components/OutputPanel";
import StatusBar from "@/app/editor/_components/StatusBar";
import dynamic from "next/dynamic";
import LiveAvatars from "@/app/collaborate/_components/LiveAvatars";
import ResizableEditorLayout from "@/components/ResizableEditorLayout";

const CollaborativeCodeEditor = dynamic(
  () => import("@/app/collaborate/_components/CollaborativeCodeEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-canvas text-caption text-mute font-mono">
        <div className="w-4 h-4 border-2 border-hairline border-t-link rounded-full animate-spin mr-2" />
        Loading Collaborative Editor...
      </div>
    ),
  }
);
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import {
  RoomProvider,
  useBroadcastEvent,
  useEventListener,
  useSelf,
  RoomEvent,
} from "../../../../liveblocks.config";
import {
  Copy,
  Check,
  MessageSquare,
  LogOut,
  Circle,
  Shield,
  Code2,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  Download,
  FolderPlus,
  Timer as TimerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import RoomChatPanel, { ChatMessage } from "@/app/collaborate/_components/RoomChatPanel";
import VoiceChatControls from "@/app/collaborate/_components/VoiceChatControls";
import SaveSnippetModal from "@/app/collaborate/_components/SaveSnippetModal";
import { LANGUAGE_CONFIG } from "@/lib/constants";
import {
  playRoomCreatedSound,
  playRoomDeletedSound,
  playChatMessageSound,
  playUserJoinedSound,
} from "@/lib/soundEffects";

// ─── Inner room content (must be inside RoomProvider) ───
function CollaborativeRoomContent({
  roomId,
}: {
  roomId: string;
}) {
  const router = useRouter();
  const { user } = useAuthContext();

  const [copied, setCopied] = useState(false);
  const { language, runCode, setLanguage } = useCodeEditorStore();

  // ─── Convex queries & mutations ───
  const joinSessionMut = useMutation(api.collaborativeSessions.joinSession);
  const createSessionMut = useMutation(api.collaborativeSessions.createSession);
  const updateSessionCodeMut = useMutation(api.collaborativeSessions.updateSessionCode);
  const deleteSessionMut = useMutation(api.collaborativeSessions.deleteSession);
  const heartbeatMut = useMutation(api.collaborativeSessions.heartbeat);
  const createSnippetMut = useMutation(api.snippets.createSnippet);
  const leaveSessionMut = useMutation(api.collaborativeSessions.leaveSession);

  const roomAdmin = useQuery(
    api.collaborativeSessions.getRoomAdmin,
    roomId ? { roomId } : "skip",
  );

  const session = useQuery(
    api.collaborativeSessions.getSessionByRoomId,
    roomId ? { roomId } : "skip",
  );

  const isAdmin = !!(user && roomAdmin && roomAdmin.hostUserId === user.userId);

  // ─── Create session if first user (becomes admin) ───
  useEffect(() => {
    if (!roomId || !user || roomAdmin === undefined) return;

    if (roomAdmin === null) {
      createSessionMut({
        roomId,
        title: `Room ${roomId}`,
        language: language || "javascript",
        code: "",
        hostUserId: user.userId,
        hostUserName: user.name || "Anonymous Developer",
      }).catch(() => {
        // Session might already exist from another tab
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId, roomAdmin]);

  // ─── Participant tracking (Convex-based, kept for persistence) ───
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

  // ─── Heartbeat ───
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

  const broadcast = useBroadcastEvent();
  const self = useSelf();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [followedUserName, setFollowedUserName] = useState<string | null>(null);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showSaveSnippetModal, setShowSaveSnippetModal] = useState(false);

  const isReceivingRemoteOutput = useRef(false);

  // Timer Countdown Ticker
  useEffect(() => {
    if (!timerEndTime) {
      setTimerRemainingSeconds(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setTimerRemainingSeconds(remaining);

      if (remaining === 0) {
        setTimerEndTime(null);
        playRoomCreatedSound();
        toast("⏱️ Time's up! Room session timer completed.", { icon: "🎉" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEndTime]);

  // ─── Liveblocks Event Listener ───
  useEventListener(({ event }: { event: RoomEvent }) => {
    if (event.type === "USER_JOINED") {
      playUserJoinedSound();
      toast(`${event.userName} joined the room! 🎉`, { icon: "👋" });
    } else if (event.type === "USER_LEFT") {
      toast(`${event.userName} left the room`, { icon: "🚪" });
    } else if (event.type === "USER_KICKED") {
      const isTarget =
        event.targetUserId === self?.connectionId.toString() ||
        (user && event.targetUserName === user.name);

      if (isTarget) {
        toast.error("You were removed from the room by the admin.");
        router.push("/collaborate");
      } else {
        toast(`${event.targetUserName} was removed from the room`, { icon: "🚪" });
      }
    } else if (event.type === "CHAT_MESSAGE") {
      playChatMessageSound();
      setMessages((prev) => [...prev, event.message]);
      if (!isChatOpen) {
        setUnreadCount((c) => c + 1);
      }
    } else if (event.type === "CODE_EXECUTED") {
      toast(`${event.userName} ran the code!`, { icon: "⚡" });
      runCode();
    } else if (event.type === "LANGUAGE_CHANGED") {
      setLanguage(event.language, true);
    } else if (event.type === "ROOM_LOCK_TOGGLED") {
      setIsLocked(event.isLocked);
      toast(
        event.isLocked
          ? `Room set to Read-Only Presentation Mode by ${event.lockedBy}`
          : `Room unlocked for Open Collaboration by ${event.lockedBy}`,
        { icon: event.isLocked ? "🔒" : "🔓" }
      );
    } else if (event.type === "OUTPUT_UPDATED") {
      isReceivingRemoteOutput.current = true;
      useCodeEditorStore.setState({
        output: event.output,
        error: event.error,
        isRunning: event.isRunning,
      });
      setTimeout(() => {
        isReceivingRemoteOutput.current = false;
      }, 100);
    } else if (event.type === "TIMER_UPDATED") {
      setTimerEndTime(event.timerEndTime);
      if (event.isTimerRunning && event.durationMinutes > 0) {
        toast(`Timer set to ${event.durationMinutes}m by Admin`, { icon: "⏱️" });
      }
    }
  });

  const handleStartTimer = (durationMinutes: number) => {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    setTimerEndTime(endTime);
    setShowTimerMenu(false);
    broadcast({
      type: "TIMER_UPDATED",
      timerEndTime: endTime,
      durationMinutes,
      isTimerRunning: true,
    });
    toast.success(`Started ${durationMinutes}m challenge timer!`);
  };

  const handleStopTimer = () => {
    setTimerEndTime(null);
    setShowTimerMenu(false);
    broadcast({
      type: "TIMER_UPDATED",
      timerEndTime: null,
      durationMinutes: 0,
      isTimerRunning: false,
    });
    toast("Timer stopped", { icon: "⏱️" });
  };

  const handleExportCode = () => {
    const editorCode = useCodeEditorStore.getState().editor?.getValue() || session?.code || "";
    if (!editorCode.trim()) {
      toast.error("Code editor is empty");
      return;
    }

    const currentLangConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.javascript;
    const blob = new Blob([editorCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pixelcode-${roomId}${currentLangConfig.fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    playChatMessageSound();
    toast.success(`Exported code as ${currentLangConfig.fileName}`);
  };

  const handleSaveToSnippets = () => {
    if (!user) {
      toast.error("Please sign in to save snippets");
      return;
    }

    const editorCode = useCodeEditorStore.getState().editor?.getValue() || session?.code || "";
    if (!editorCode.trim()) {
      toast.error("Code editor is empty");
      return;
    }

    setShowSaveSnippetModal(true);
  };

  const handleSaveToSnippetsConfirmed = async (title: string, isPublic: boolean) => {
    if (!user) {
      toast.error("Please sign in to save snippets");
      return;
    }

    const editorCode = useCodeEditorStore.getState().editor?.getValue() || session?.code || "";
    if (!editorCode.trim()) {
      toast.error("Code editor is empty");
      return;
    }

    await createSnippetMut({
      userId: user.userId,
      userName: user.name || "Anonymous Developer",
      title,
      language: language || "javascript",
      code: editorCode,
      isPublic,
    });

    playRoomCreatedSound();
    toast.success(
      isPublic
        ? "Snippet published to Community Snippets! 🌍"
        : "Snippet saved privately to your library 🔒"
    );
  };

  // ─── Broadcast USER_JOINED when entering room via URL ───
  useEffect(() => {
    if (self) {
      const currentName = user?.name || "Guest Developer";
      broadcast({ type: "USER_JOINED", userName: currentName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [self?.connectionId]);

  const handleKickUser = (targetUserId: string, targetUserName: string) => {
    if (!isAdmin) return;
    toast.success(`Removed ${targetUserName} from room`);
    broadcast({
      type: "USER_KICKED",
      targetUserId,
      targetUserName,
    });
  };

  const handleToggleLock = () => {
    if (!isAdmin) return;
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    broadcast({
      type: "ROOM_LOCK_TOGGLED",
      isLocked: nextLocked,
      lockedBy: user?.name || "Admin",
    });
    toast.success(
      nextLocked
        ? "Room locked to Read-Only Presentation mode"
        : "Room unlocked for Open Collaboration"
    );
  };

  const handleFollowUser = (targetUserName: string) => {
    if (followedUserName === targetUserName) {
      setFollowedUserName(null);
      toast("Stopped following cursor", { icon: "🎯" });
    } else {
      setFollowedUserName(targetUserName);
      toast(`Following ${targetUserName}'s cursor`, { icon: "🎯" });
    }
  };

  const handleSendMessage = (text: string) => {
    playChatMessageSound();
    const currentName = user?.name || "Guest Developer";
    const presenceUser = self?.presence?.user as { color?: string } | undefined;
    const infoUser = self?.info as { color?: string } | undefined;
    const userColor = presenceUser?.color || infoUser?.color || "#58a6ff";

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: self?.connectionId.toString() || "local",
      senderName: currentName,
      senderColor: userColor,
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

    broadcast({
      type: "CHAT_MESSAGE",
      message: newMessage,
    });
  };

  // ─── Broadcast code execution output to all room participants ───
  useEffect(() => {
    let lastOutput = "";
    let lastError: string | null = null;
    let lastRunning = false;

    const unsubscribe = useCodeEditorStore.subscribe((state) => {
      if (isReceivingRemoteOutput.current) return;

      if (
        state.output === lastOutput &&
        state.error === lastError &&
        state.isRunning === lastRunning
      ) {
        return;
      }

      lastOutput = state.output;
      lastError = state.error;
      lastRunning = state.isRunning;

      broadcast({
        type: "OUTPUT_UPDATED",
        output: state.output,
        error: state.error,
        isRunning: state.isRunning,
        userName: user?.name || "Collaborator",
      });
    });
    return () => unsubscribe();
  }, [broadcast, user?.name]);

  // ─── Sync session language from Convex ───
  useEffect(() => {
    if (session?.language && session.language !== language) {
      setLanguage(session.language, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.language]);

  // ─── Admin language change → Convex + Liveblocks broadcast ───
  useEffect(() => {
    if (
      isAdmin &&
      roomId &&
      language &&
      session &&
      session.language !== language
    ) {
      updateSessionCodeMut({
        roomId,
        code: session.code || "",
        language,
      });

      broadcast({ type: "LANGUAGE_CHANGED", language });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, language]);

  // ─── Auto-redirect if room is deleted ───
  useEffect(() => {
    if (session === null && roomAdmin !== undefined) {
      playRoomDeletedSound();
      toast("The room session has been ended by the Admin.", { icon: "ℹ️" });
      router.push("/collaborate");
    }
  }, [session, roomAdmin, router]);

  // ─── Persist code changes to Convex (debounced, called by editor) ───
  const handleCodeChange = useCallback(
    (code: string) => {
      if (roomId) {
        updateSessionCodeMut({ roomId, code });
      }
    },
    [roomId, updateSessionCodeMut],
  );

  const copyRoomLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Room link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleLeave = useCallback(() => {
    const currentName = user?.name || "Guest Developer";
    broadcast({ type: "USER_LEFT", userName: currentName });
    router.push("/collaborate");
  }, [broadcast, user?.name, router]);

  const handleDeleteRoom = useCallback(async () => {
    if (!user || !roomId) return;
    if (
      window.confirm(
        "Are you sure you want to delete this room? All participants will be redirected.",
      )
    ) {
      try {
        await deleteSessionMut({ roomId, userId: user.userId });
        playRoomDeletedSound();
        toast.success("Room session deleted");
        router.push("/collaborate");
      } catch {
        toast.error("Failed to delete room");
      }
    }
  }, [user, roomId, deleteSessionMut, router]);

  const currentSessionCode =
    session?.code !== undefined
      ? session.code
      : useCodeEditorStore.getState().getCode();

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />

      {/* Room toolbar */}
      <div className="min-h-[3rem] px-4 bg-canvas-soft-2 border-b border-hairline flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-body-sm relative z-40 overflow-visible shrink-0">
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
                  Collaborator
                </>
              )}
            </div>
          )}

          <span className="text-hairline">|</span>

          {/* Live avatars (Liveblocks-powered with Admin Kick Controls) */}
          <LiveAvatars 
            isAdmin={isAdmin} 
            onKickUser={handleKickUser} 
            onFollowUser={handleFollowUser}
            followedUserName={followedUserName}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Room Challenge Timer Display & Menu */}
          {timerRemainingSeconds !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-link/15 border border-link/30 text-link font-mono font-bold text-xs animate-pulse">
              <TimerIcon className="w-3.5 h-3.5" />
              <span>
                {Math.floor(timerRemainingSeconds / 60)}:
                {String(timerRemainingSeconds % 60).padStart(2, "0")}
              </span>
            </div>
          )}

          {isAdmin && (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTimerMenu((prev) => !prev)}
                icon={<TimerIcon className="w-3.5 h-3.5" />}
              >
                Timer
              </Button>

              {showTimerMenu && (
                <div className="absolute top-full right-0 mt-1.5 z-50 w-44 bg-canvas-dark border border-hairline/80 rounded-xl shadow-2xl backdrop-blur-xl p-1.5 flex flex-col gap-1 text-xs">
                  <span className="px-2 py-1 font-semibold text-mute text-[10px] uppercase tracking-wider">
                    Start Challenge Timer
                  </span>
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleStartTimer(mins)}
                      className="px-2.5 py-1.5 rounded-md text-left hover:bg-surface text-foreground transition-colors font-medium"
                    >
                      {mins} Minutes Sprint
                    </button>
                  ))}
                  {timerRemainingSeconds !== null && (
                    <button
                      onClick={handleStopTimer}
                      className="px-2.5 py-1.5 rounded-md text-left hover:bg-error/15 text-error transition-colors font-medium border-t border-hairline/50 mt-1"
                    >
                      Stop Timer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 1-Click Code Export */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCode}
            icon={<Download className="w-3.5 h-3.5" />}
            title="Download room code file"
          >
            Export
          </Button>

          {/* Save to Snippets → opens modal for title & visibility */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveToSnippets}
            icon={<FolderPlus className="w-3.5 h-3.5" />}
            title="Save code to your personal Snippets dashboard"
          >
            Save Snippet
          </Button>

          {/* Admin Lock / Read-Only Toggle Button */}
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleLock}
              icon={isLocked ? <Lock className="w-3.5 h-3.5 text-warning" /> : <Unlock className="w-3.5 h-3.5 text-success" />}
              className={isLocked ? "border-warning text-warning font-semibold" : ""}
            >
              {isLocked ? "Locked Mode" : "Open Editing"}
            </Button>
          )}

          {/* Live Chat Session Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsChatOpen((prev) => !prev);
              setUnreadCount(0);
            }}
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            className={unreadCount > 0 ? "border-link text-link font-semibold" : ""}
          >
            Chat
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-link text-white text-[10px] font-bold tabular-nums">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Voice Chat Controls */}
          <VoiceChatControls currentUserId={user?.userId || "anonymous"} />

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

      {/* Main editor area — Draggable Resizable Splitter between Code Editor and Output Console */}
      <ResizableEditorLayout
        left={
          <div className="flex-1 min-h-0 min-w-0 flex flex-col h-full">
            <CollaborativeCodeEditor
              currentUser={{
                name: user?.name || "Guest Developer",
              }}
              initialCode={currentSessionCode}
              onCodeChange={handleCodeChange}
              followedUserName={followedUserName}
              onStopFollow={() => setFollowedUserName(null)}
              isLocked={isLocked}
              isAdmin={isAdmin}
            />
          </div>
        }
        right={
          <div className="h-full flex flex-col">
            <OutputPanel />
          </div>
        }
      />

      <StatusBar />

      {/* Live Room Chat Drawer */}
      <RoomChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUserId={self?.connectionId.toString() || "local"}
      />

      {/* Save Snippet Modal with Public/Private selection */}
      <SaveSnippetModal
        isOpen={showSaveSnippetModal}
        onClose={() => setShowSaveSnippetModal(false)}
        onSave={handleSaveToSnippetsConfirmed}
        language={language || "javascript"}
        roomId={roomId}
      />
    </div>
  );
}

// ─── Loading state ───
function CollaborativeRoomLoading() {
  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-link animate-spin" />
          <div className="text-center">
            <p className="text-body-sm font-medium text-ink">
              Connecting to collaborative session...
            </p>
            <p className="text-caption text-mute mt-1">
              Setting up real-time sync with Liveblocks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page component (wraps in RoomProvider) ───
export default function CollaborativeRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  if (!roomId) return null;

  // The Liveblocks room ID is prefixed to avoid collisions with other apps
  const liveblocksRoomId = `pixelcode:${roomId}`;

  return (
    <RoomProvider
      id={liveblocksRoomId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<CollaborativeRoomLoading />}>
        <CollaborativeRoomContent roomId={roomId} />
      </ClientSideSuspense>
    </RoomProvider>
  );
}
