import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Presence — what every user can broadcast to others
type Presence = {
  cursor: { lineNumber: number; column: number } | null;
  user?: {
    name: string;
    color: string;
    colorLight?: string;
  } | null;
};

// User metadata attached via authentication
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar?: string;
    color: string;
  };
};

export type RoomEvent =
  | { type: "CODE_EXECUTED"; userName: string }
  | { type: "LANGUAGE_CHANGED"; language: string }
  | {
      type: "CHAT_MESSAGE";
      message: {
        id: string;
        senderId: string;
        senderName: string;
        senderColor: string;
        text: string;
        timestamp: number;
      };
    }
  | { type: "USER_KICKED"; targetUserId: string; targetUserName: string }
  | { type: "USER_JOINED"; userName: string }
  | { type: "USER_LEFT"; userName: string }
  | { type: "ROOM_LOCK_TOGGLED"; isLocked: boolean; lockedBy: string }
  | {
      type: "OUTPUT_UPDATED";
      output: string;
      error: string | null;
      isRunning: boolean;
      userName: string;
    }
  | {
      type: "TIMER_UPDATED";
      timerEndTime: number | null;
      durationMinutes: number;
      isTimerRunning: boolean;
    }
  | {
      type: "VOICE_SIGNAL";
      senderId: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signal: any;
    };

type ThreadMetadata = Record<string, never>;

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useSelf,
  useUpdateMyPresence,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<
  Presence,
  Record<string, never>,
  UserMeta,
  RoomEvent,
  ThreadMetadata
>(client);
