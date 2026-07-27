import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    roomId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const session = await ctx.db.insert("collaborativeSessions", {
      roomId: args.roomId,
      hostUserId: identity.subject,
      hostUserName: identity.name || "Anonymous Developer",
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
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const session = await ctx.db
      .query("collaborativeSessions")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!session) return;

    if (session.hostUserId !== identity.subject) {
      throw new ConvexError("Only the session host can end the room");
    }

    await ctx.db.patch(session._id, {
      isActive: false,
    });
  },
});
