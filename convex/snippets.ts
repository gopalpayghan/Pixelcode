import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("User ID is required");

    const snippetId = await ctx.db.insert("snippets", {
      userId: args.userId,
      userName: args.userName,
      title: args.title,
      language: args.language,
      code: args.code,
    });

    return snippetId;
  },
});

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    if (snippet.userId !== args.userId) {
      throw new Error("Not authorized to delete this snippet");
    }

    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", args.snippetId))
      .collect();

    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    await ctx.db.delete(args.snippetId);
  },
});

export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("User ID is required");

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id", (q) =>
        q.eq("userId", args.userId).eq("snippetId", args.snippetId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("stars", {
        userId: args.userId,
        snippetId: args.snippetId,
      });
    }
  },
});

export const addComment = mutation({
  args: {
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("User ID is required");

    return await ctx.db.insert("snippetComments", {
      snippetId: args.snippetId,
      userId: args.userId,
      userName: args.userName,
      content: args.content,
    });
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("snippetComments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== args.userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    const snippets = await ctx.db.query("snippets").order("desc").collect();
    return snippets;
  },
});

export const getSnippetById = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    return snippet;
  },
});

export const getComments = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", args.snippetId))
      .order("desc")
      .collect();

    return comments;
  },
});

export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;

    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id", (q) =>
        q.eq("userId", args.userId).eq("snippetId", args.snippetId)
      )
      .first();

    return !!star;
  },
});

export const getSnippetStarCount = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", args.snippetId))
      .collect();

    return stars.length;
  },
});

export const getStarredSnippets = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const snippets = await Promise.all(stars.map((star) => ctx.db.get(star.snippetId)));

    return snippets.filter((snippet) => snippet !== null);
  },
});
