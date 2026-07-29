"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DD0E1",
  "#4DB6AC", "#81C784", "#AED581", "#FFD54F",
  "#FFB74D", "#FF8A65", "#A1887F", "#90A4AE",
];

export function LiveblocksProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}
      resolveUsers={async ({ userIds }) => {
        // Return user info for each userId
        return userIds.map((userId) => ({
          name: userId,
          avatar: undefined,
          color: COLORS[Math.abs(hashCode(userId)) % COLORS.length],
        }));
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}

// Simple hash function for consistent color assignment
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
