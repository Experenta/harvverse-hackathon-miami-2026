import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Create or get a conversation
export const createConversation = mutation({
  args: {
    conversationId: v.string(),
    lotCode: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_id")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();
    const _id = await ctx.db.insert("conversations", {
      conversationId: args.conversationId,
      lotCode: args.lotCode,
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });

    return { _id, ...args, createdAt: now, updatedAt: now };
  },
});

// Add a message to conversation
export const addMessage = mutation({
  args: {
    conversationId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    rule: v.optional(v.string()),
    toolsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      rule: args.rule,
      toolsUsed: args.toolsUsed,
      createdAt: now,
    });

    // Update conversation timestamp
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_id")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .first();

    if (conversation) {
      await ctx.db.patch(conversation._id, { updatedAt: now });
    }

    return { _id: messageId, ...args, createdAt: now };
  },
});

// Get conversation history
export const getConversationHistory = query({
  args: {
    conversationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_time")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .order("asc")
      .take(args.limit || 50);

    return messages;
  },
});

// Get conversation metadata
export const getConversation = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_id")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .first();

    return conversation;
  },
});

// Get all conversations for a lot
export const getConversationsByLot = query({
  args: {
    lotCode: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_lot_code")
      .filter((f) => f.eq(f.field("lotCode"), args.lotCode))
      .order("desc")
      .collect();

    return conversations;
  },
});

// Get latest messages from a conversation
export const getLatestMessages = query({
  args: {
    conversationId: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_time")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .order("desc")
      .take(args.count || 10);

    return messages.reverse();
  },
});

// Delete a conversation and its messages
export const deleteConversation = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete all messages
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_id")
      .filter((f) => f.eq(f.field("conversationId"), args.conversationId))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }

    return { success: true };
  },
});
