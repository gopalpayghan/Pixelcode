"use client";

import React, { useState, useRef, useEffect } from "react";
import { useOthers, useSelf } from "../../../../liveblocks.config";
import { UserX, Users, Crown, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AVATAR_COLORS = [
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

function getColorForUser(name: string): string {
  return AVATAR_COLORS[Math.abs(hashCode(name)) % AVATAR_COLORS.length];
}

interface LiveAvatarsProps {
  isAdmin?: boolean;
  onKickUser?: (targetUserId: string, targetUserName: string) => void;
  onFollowUser?: (targetUserName: string) => void;
  followedUserName?: string | null;
}

export default function LiveAvatars({
  isAdmin,
  onKickUser,
  onFollowUser,
  followedUserName,
}: LiveAvatarsProps) {
  const others = useOthers();
  const self = useSelf();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build list: self first, then others
  const allUsers: { id: string; name: string; isSelf: boolean }[] = [];

  if (self) {
    const selfName =
      (self.presence as { user?: { name?: string } } | undefined)?.user?.name ||
      (self.info as { name?: string } | undefined)?.name ||
      "You";

    allUsers.push({
      id: self.connectionId.toString(),
      name: selfName,
      isSelf: true,
    });
  }

  others.forEach((other) => {
    const otherName =
      (other.presence as { user?: { name?: string } } | undefined)?.user?.name ||
      (other.info as { name?: string } | undefined)?.name ||
      `Developer ${other.connectionId}`;

    allUsers.push({
      id: other.connectionId.toString(),
      name: otherName,
      isSelf: false,
    });
  });

  const displayUsers = allUsers.slice(0, 5);
  const overflowCount = allUsers.length - displayUsers.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatars Bar / Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-hairline/40 transition-colors group"
        title="View active room participants"
      >
        {displayUsers.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {displayUsers.map((u) => {
              const color = getColorForUser(u.name);
              return (
                <div
                  key={u.id}
                  className={`w-6 h-6 rounded-full font-semibold text-[10px] flex items-center justify-center uppercase border-2 border-canvas-soft-2 shrink-0 transition-transform group-hover:scale-105 ${
                    u.isSelf ? "ring-1 ring-link/40" : ""
                  }`}
                  style={{
                    backgroundColor: color + "30",
                    color: color,
                  }}
                >
                  {u.name.charAt(0)}
                </div>
              );
            })}

            {overflowCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-canvas-soft text-mute font-semibold text-[10px] flex items-center justify-center border-2 border-canvas-soft-2 shrink-0">
                +{overflowCount}
              </div>
            )}
          </div>
        )}

        <span className="text-caption text-body group-hover:text-foreground transition-colors font-medium">
          {allUsers.length} {allUsers.length === 1 ? "User" : "Users"} Online
        </span>
      </button>

      {/* Participants Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 z-50 w-64 bg-canvas-dark border border-hairline/80 
                       rounded-xl shadow-2xl backdrop-blur-xl p-2 flex flex-col gap-1 overflow-hidden"
          >
            <div className="px-2 py-1.5 border-b border-hairline/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-link" />
                Active Participants
              </span>
              <span className="text-[10px] font-mono text-mute px-1.5 py-0.5 rounded bg-surface">
                {allUsers.length}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1 space-y-1">
              {allUsers.map((u, idx) => {
                const color = getColorForUser(u.name);
                const isRoomHost = idx === 0; // First joined user is admin
                const isBeingFollowed = followedUserName === u.name;

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center uppercase shrink-0"
                        style={{
                          backgroundColor: color + "30",
                          color: color,
                        }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-foreground truncate">
                          {u.name} {u.isSelf && "(You)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!u.isSelf && onFollowUser && (
                        <button
                          onClick={() => {
                            onFollowUser(u.name);
                            setIsOpen(false);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isBeingFollowed
                              ? "bg-link text-white"
                              : "text-mute hover:text-link hover:bg-link/15"
                          }`}
                          title={isBeingFollowed ? `Following ${u.name}` : `Follow ${u.name}'s cursor`}
                        >
                          <Target className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isRoomHost ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-warning/15 text-warning">
                          <Crown className="w-2.5 h-2.5" /> Host
                        </span>
                      ) : (
                        isAdmin &&
                        !u.isSelf &&
                        onKickUser && (
                          <button
                            onClick={() => {
                              onKickUser(u.id, u.name);
                              setIsOpen(false);
                            }}
                            className="p-1 rounded-md text-error/80 hover:text-error hover:bg-error/15 transition-colors"
                            title={`Remove ${u.name} from room`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
