"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import NavigationHeader from "@/components/NavigationHeader";
import EditorTopBar from "@/app/editor/_components/EditorTopBar";
import CodePanel from "@/app/editor/_components/CodePanel";
import OutputPanel from "@/app/editor/_components/OutputPanel";
import StatusBar from "@/app/editor/_components/StatusBar";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useSocket } from "@/components/providers/SocketProvider";
import { Users, Copy, Check, LogOut, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export default function CollaborativeRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { user } = useUser();
  const { socket, isConnected } = useSocket();

  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { editor, setLanguage, runCode } = useCodeEditorStore();

  const isRemoteUpdatingRef = useRef(false);

  // Initialize socket room
  useEffect(() => {
    if (!socket || !isConnected || !roomId || !user) return;

    socket.emit("join-room", {
      roomId,
      user: {
        id: user.id,
        name: user.fullName || user.username || "Anonymous",
        avatar: user.imageUrl,
      },
    });

    socket.on("room-users", (users: Participant[]) => {
      setParticipants(users);
    });

    socket.on("user-joined", (newUser: Participant) => {
      toast.success(`${newUser.name} joined the room`);
      setParticipants((prev) => {
        if (prev.some((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    socket.on("user-left", (leftUser: { userId: string }) => {
      setParticipants((prev) => prev.filter((u) => u.id !== leftUser.userId));
    });

    socket.on("code-update", (data: { code: string; language: string }) => {
      if (editor) {
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
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("code-update");
      socket.off("language-update");
      socket.off("code-execution");
    };
  }, [socket, isConnected, roomId, user, editor, setLanguage, runCode]);

  useEffect(() => {
    if (!editor || !socket || !isConnected) return;

    const disposable = editor.onDidChangeModelContent(() => {
      if (isRemoteUpdatingRef.current) return;
      const code = editor.getValue();
      socket.emit("code-change", {
        roomId,
        code,
        language: useCodeEditorStore.getState().language,
      });
    });

    return () => {
      disposable.dispose();
    };
  }, [editor, socket, isConnected, roomId]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Room link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    router.push("/collaborate");
  };

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />

      <div className="h-12 px-4 bg-canvas-soft-2 border-b border-hairline flex items-center justify-between text-body-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Circle className="w-2.5 h-2.5 fill-success text-success animate-pulse" />
            <span className="font-mono text-ink font-semibold">{roomId}</span>
          </div>

          <span className="text-hairline">|</span>

          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-mute" />
            <span className="text-caption text-body">
              {participants.length} Active {participants.length === 1 ? "User" : "Users"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={copyRoomLink}
            icon={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? "Copied Link" : "Invite Partner"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            icon={<LogOut className="w-3.5 h-3.5 text-error" />}
            className="text-error hover:bg-error/10"
          >
            Leave
          </Button>
        </div>
      </div>

      <EditorTopBar />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-0 min-w-0 border-r border-hairline">
          <CodePanel />
        </div>

        <div className="lg:w-[420px] min-h-0 flex flex-col border-t lg:border-t-0 border-hairline">
          <OutputPanel />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
