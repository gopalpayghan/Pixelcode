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
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!session) return;

    if (session.hostUserId !== args.userId) {
      throw new ConvexError("Only the session host can end the room");
    }

    await ctx.db.patch(session._id, {
      isActive: false,
    });
  },
});

export const deleteSession = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!session) return;

    if (session.hostUserId !== args.userId) {
      throw new ConvexError("Only the session host can delete the room");
    }

    // Delete all participants for this room
    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const p of participants) {
      await ctx.db.delete(p._id);
    }

    // Delete all change requests for this room
    const requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const r of requests) {
      await ctx.db.delete(r._id);
    }

    // Delete the session document itself
    await ctx.db.delete(session._id);
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
