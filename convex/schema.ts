import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(),
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
  }).index("by_snippet_id", ["snippetId"]),

  stars: defineTable({
    userId: v.string(),
    snippetId: v.id("snippets"),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetId"])
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]),

  collaborativeSessions: defineTable({
    roomId: v.string(),
    hostUserId: v.string(),
    hostUserName: v.string(),
    language: v.string(),
    code: v.string(),
    title: v.string(),
    isActive: v.boolean(),
  })
    .index("by_room_id", ["roomId"])
    .index("by_host_user_id", ["hostUserId"]),

  roomParticipants: defineTable({
    roomId: v.string(),
    userId: v.string(),
    userName: v.string(),
    avatar: v.optional(v.string()),
    lastSeen: v.number(),
    cursorLine: v.optional(v.number()),
    cursorColumn: v.optional(v.number()),
  })
    .index("by_room_id", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  changeRequests: defineTable({
    roomId: v.string(),
    authorUserId: v.string(),
    authorUserName: v.string(),
    description: v.string(),
    originalCode: v.string(),
    proposedCode: v.string(),
    language: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_room_id", ["roomId"])
    .index("by_room_and_status", ["roomId", "status"]),
});
