"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useBroadcastEvent, useEventListener, RoomEvent } from "../../../../liveblocks.config";

interface VoiceChatControlsProps {
  currentUserId: string;
}

export default function VoiceChatControls({ currentUserId }: VoiceChatControlsProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const broadcast = useBroadcastEvent();

  // Clean up media streams and peer connections on unmount
  const stopVoice = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setIsActive(false);
    setIsMuted(true);
  }, []);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  // Handle incoming WebRTC signaling events
  useEventListener(({ event }: { event: RoomEvent }) => {
    if (event.type !== "VOICE_SIGNAL" || event.senderId === currentUserId) return;

    const { senderId, signal } = event;

    if (signal.type === "offer") {
      handleOffer(senderId, signal.offer);
    } else if (signal.type === "answer") {
      handleAnswer(senderId, signal.answer);
    } else if (signal.type === "candidate") {
      handleCandidate(senderId, signal.candidate);
    }
  });

  const createPeerConnection = (remoteUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        broadcast({
          type: "VOICE_SIGNAL",
          senderId: currentUserId,
          signal: { type: "candidate", candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      let remoteAudio = document.getElementById(
        `remote-audio-${remoteUserId}`
      ) as HTMLAudioElement;
      if (!remoteAudio) {
        remoteAudio = document.createElement("audio");
        remoteAudio.id = `remote-audio-${remoteUserId}`;
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);
      }
      remoteAudio.srcObject = e.streams[0];
      remoteAudio.muted = isDeafened;
    };

    peerConnectionsRef.current.set(remoteUserId, pc);
    return pc;
  };

  const handleOffer = async (remoteUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      broadcast({
        type: "VOICE_SIGNAL",
        senderId: currentUserId,
        signal: { type: "answer", answer },
      });
    } catch {}
  };

  const handleAnswer = async (remoteUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch {}
  };

  const handleCandidate = async (remoteUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch {}
  };

  const toggleMic = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMuted(false);
        setIsActive(true);
        toast.success("Microphone connected! Voice active", { icon: "🎙️" });
      } catch {
        toast.error("Microphone access denied or not found");
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
        setIsMuted(!localStreamRef.current.getAudioTracks()[0]?.enabled);
      } else {
        stopVoice();
      }
    }
  };

  const toggleDeafen = () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    document.querySelectorAll("audio[id^='remote-audio-']").forEach((el) => {
      (el as HTMLAudioElement).muted = nextDeafened;
    });
    toast(nextDeafened ? "Muted all incoming audio" : "Audio unmuted", {
      icon: nextDeafened ? "🔇" : "🔊",
    });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Microphone Toggle Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleMic}
        icon={
          !isMuted ? (
            <Mic className="w-3.5 h-3.5 text-success animate-pulse" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )
        }
        className={!isMuted ? "border-success text-success font-semibold" : ""}
        title={!isMuted ? "Mute Microphone" : "Unmute Microphone"}
      >
        {!isMuted ? "Voice On" : "Voice Off"}
      </Button>

      {/* Audio Output Deafen Button */}
      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDeafen}
          className="p-1.5"
          title={isDeafened ? "Unmute All Audio" : "Deafen All Audio"}
        >
          {isDeafened ? (
            <VolumeX className="w-3.5 h-3.5 text-error" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-body" />
          )}
        </Button>
      )}
    </div>
  );
}
