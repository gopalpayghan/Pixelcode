import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    roomId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    hostUserId: v.string(),
    hostUserName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if session already exists for this room
    const existing = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (existing) return existing._id;

    const session = await ctx.db.insert("collaborativeSessions", {
      roomId: args.roomId,
      hostUserId: args.hostUserId,
      hostUserName: args.hostUserName,
      title: args.title,
      language: args.language,
      code: args.code,
      isActive: true,
    });

    return session;
  },
});

export const getSessionByRoomId = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    return session;
  },
});

export const updateSessionCode = mutation({
  args: {
    roomId: v.string(),
    code: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!session) return;

    await ctx.db.patch(session._id, {
      code: args.code,
      ...(args.language ? { language: args.language } : {}),
    });
  },
});

export const endSession = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (sessions.length === 0) return;

    const isHost = sessions.some((s) => s.hostUserId === args.userId);
    if (!isHost) {
      throw new ConvexError("Only the session host can end the room");
    }

    // 1. Delete all roomParticipants for this room
    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const p of participants) {
      await ctx.db.delete(p._id);
    }

    // 2. Delete all changeRequests for this room
    const requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const r of requests) {
      await ctx.db.delete(r._id);
    }

    // 3. Delete ALL collaborativeSessions records for this room
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }
  },
});

export const deleteSession = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (sessions.length === 0) return;

    const isHost = sessions.some((s) => s.hostUserId === args.userId);
    if (!isHost) {
      throw new ConvexError("Only the session host can delete the room");
    }

    // 1. Delete all roomParticipants for this room
    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const p of participants) {
      await ctx.db.delete(p._id);
    }

    // 2. Delete all changeRequests for this room
    const requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const r of requests) {
      await ctx.db.delete(r._id);
    }

    // 3. Delete ALL collaborativeSessions records for this room
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }
  },
});

/**
 * Auto-cleanup mutation: Purges abandoned rooms and stale participant records
 * older than 1 hour to keep DB usage 100% temporary per room.
 */
export const cleanupInactiveRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - 3600_000;

    // 1. Purge stale participants inactive for > 1 hour
    const staleParticipants = await ctx.db
      .query("roomParticipants")
      .filter((q) => q.lt(q.field("lastSeen"), oneHourAgo))
      .collect();

    for (const p of staleParticipants) {
      await ctx.db.delete(p._id);
    }
  },
});

// ─── Participant tracking (Convex-based real-time) ───

export const joinSession = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if participant already exists in this room
    const existing = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .first();

    if (existing) {
      // Update lastSeen timestamp
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        userName: args.userName,
        avatar: args.avatar,
      });
      return existing._id;
    }

    // Insert new participant
    return await ctx.db.insert("roomParticipants", {
      roomId: args.roomId,
      userId: args.userId,
      userName: args.userName,
      avatar: args.avatar,
      lastSeen: Date.now(),
    });
  },
});

export const leaveSession = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .first();

    if (participant) {
      await ctx.db.delete(participant._id);
    }
  },
});

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastSeen: Date.now(),
      });
    }
  },
});

export const getActiveParticipants = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const allParticipants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Only return participants seen within the last 60 seconds
    const threshold = Date.now() - 60_000;
    return allParticipants.filter((p) => p.lastSeen > threshold);
  },
});

// ─── Change Request System (GitHub-style) ───

export const getRoomAdmin = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!session) return null;

    return {
      hostUserId: session.hostUserId,
      hostUserName: session.hostUserName,
    };
  },
});

export const submitChangeRequest = mutation({
  args: {
    roomId: v.string(),
    authorUserId: v.string(),
    authorUserName: v.string(),
    description: v.string(),
    originalCode: v.string(),
    proposedCode: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("changeRequests", {
      roomId: args.roomId,
      authorUserId: args.authorUserId,
      authorUserName: args.authorUserName,
      description: args.description,
      originalCode: args.originalCode,
      proposedCode: args.proposedCode,
      language: args.language,
      status: "pending",
    });
  },
});

export const approveChangeRequest = mutation({
  args: {
    requestId: v.id("changeRequests"),
    reviewerName: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new ConvexError("Change request not found");
    if (request.status !== "pending") {
      throw new ConvexError("This change request has already been reviewed");
    }

    // Apply the proposed code to the session
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", request.roomId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        code: request.proposedCode,
        language: request.language,
      });
    }

    // Mark the request as approved
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: args.reviewerName,
      reviewedAt: Date.now(),
    });
  },
});

export const rejectChangeRequest = mutation({
  args: {
    requestId: v.id("changeRequests"),
    reviewerName: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new ConvexError("Change request not found");
    if (request.status !== "pending") {
      throw new ConvexError("This change request has already been reviewed");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: args.reviewerName,
      reviewedAt: Date.now(),
    });
  },
});

export const getChangeRequests = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .collect();

    return requests;
  },
});

export const updateCursorPosition = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    cursorLine: v.number(),
    cursorColumn: v.number(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        cursorLine: args.cursorLine,
        cursorColumn: args.cursorColumn,
        lastSeen: Date.now(),
      });
    }
  },
});
