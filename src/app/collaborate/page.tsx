"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Plus,
  ArrowRight,
  Code2,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { playRoomCreatedSound } from "@/lib/soundEffects";

export default function CollaborateLandingPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createSessionMut = useMutation(api.collaborativeSessions.createSession);

  const generateRoomId = () => {
    return "room-" + Math.random().toString(36).substring(2, 9);
  };

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error("Please sign in to create a room");
      router.push("/sign-in?redirect=/collaborate");
      return;
    }

    setIsCreating(true);
    const newRoomId = generateRoomId();

    try {
      await createSessionMut({
        roomId: newRoomId,
        title: `Room ${newRoomId}`,
        language: "javascript",
        code: "",
        hostUserId: user.userId,
        hostUserName: user.name || "Anonymous Developer",
      });

      playRoomCreatedSound();
      toast.success("Room created as Admin! Redirecting...");
      router.push(`/collaborate/${newRoomId}`);
    } catch {
      toast.error("Failed to create room session");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error("Please enter a Room ID");
      return;
    }
    const cleanId = joinRoomId.trim();
    router.push(`/collaborate/${cleanId}`);
  };

  return (
    <>
      <NavigationHeader />
      <main className="min-h-[85vh] bg-canvas flex flex-col justify-center py-16 sm:py-24">
        <div className="max-w-page-narrow mx-auto px-4 sm:px-6 w-full">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="mono-label text-mute flex items-center justify-center gap-1.5 mb-3">
              <Users className="w-3.5 h-3.5 text-link" />
              Real-time Collaboration
            </span>
            <h1 className="text-display-lg sm:text-display-xl text-ink text-balance">
              Pair program in real-time.
            </h1>
            <p className="mt-3 text-body-md text-body text-pretty">
              Create a private room to code together with teammates. Share code,
              see live cursors, and execute code in sync.
            </p>
          </div>

          {/* Actions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Create Room Card */}
            <Card
              variant="default"
              hover
              className="flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-link/10 text-link flex items-center justify-center mb-4">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-display-sm text-ink mb-2">
                  Create a New Room
                </h2>
                <p className="text-body-sm text-body">
                  Start an instant collaborative coding session. Invite anyone
                  by sharing your unique room link.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  loading={isCreating}
                  onClick={handleCreateRoom}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Create Live Room
                </Button>
              </div>
            </Card>

            {/* Join Room Card */}
            <Card
              variant="default"
              hover
              className="flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-canvas-soft-2 text-ink flex items-center justify-center mb-4 border border-hairline">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-display-sm text-ink mb-2">
                  Join Existing Room
                </h2>
                <p className="text-body-sm text-body mb-4">
                  Have a room code from a colleague? Enter it below to join
                  their live session immediately.
                </p>
              </div>
              <form onSubmit={handleJoinRoom} className="space-y-3">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="e.g. room-abc123x"
                  className="w-full h-10 px-3 bg-canvas-soft border border-hairline rounded-md text-ink placeholder:text-mute font-mono text-body-sm focus:outline-none focus:border-link"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Join Session
                </Button>
              </form>
            </Card>
          </div>

          {/* Highlights */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-12 border-t border-hairline">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-link shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body-sm font-semibold text-ink">
                  Zero Latency Sync
                </h3>
                <p className="text-caption text-mute mt-0.5">
                  Instant WebSocket code & cursor transmission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Code2 className="w-4 h-4 text-link shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body-sm font-semibold text-ink">
                  10+ Languages
                </h3>
                <p className="text-caption text-mute mt-0.5">
                  Full multi-language execution in rooms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-link shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body-sm font-semibold text-ink">
                  Private Rooms
                </h3>
                <p className="text-caption text-mute mt-0.5">
                  Only people with the link can join.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
