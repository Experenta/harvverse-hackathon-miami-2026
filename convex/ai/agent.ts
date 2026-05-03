import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { detectRule, RULES } from "../rules/types";
import { callClaudeAPI, buildSystemPrompt } from "./claudeIntegration";

export const processMessage = action({
  args: {
    conversationId: v.string(),
    message: v.string(),
    lotCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Detect which rule applies
    const detectedRule = detectRule(args.message);
    const rule = RULES[detectedRule];

    // 2. Save user message
    await ctx.runMutation(api.ai.chat.addMessage, {
      conversationId: args.conversationId,
      role: "user",
      content: args.message,
      rule: detectedRule,
    });

    // 3. Build context for the AI
    const history = await ctx.runQuery(api.ai.chat.getLatestMessages, {
      conversationId: args.conversationId,
      count: 10,
    });

    // 4. Prepare tools based on the detected rule
    const availableTools = rule.tools;

    // 5. Build the prompt for Claude
    const systemPrompt = `${rule.systemPrompt}

You are part of the Harvverse coffee platform. You have access to the following tools:
${availableTools.map(tool => `- ${tool}`).join("\n")}

When answering questions, use the relevant tools to gather data and provide specific, data-driven recommendations.
Always cite the data you're using and explain your reasoning.
If you need more information, ask the user for clarification.`;

    const conversationHistory = history.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // 6. Call Claude API
    const assistantResponse = await generateResponse(
      systemPrompt,
      conversationHistory,
      args.message,
      availableTools
    );

    // 7. Save assistant message
    await ctx.runMutation(api.ai.chat.addMessage, {
      conversationId: args.conversationId,
      role: "assistant",
      content: assistantResponse,
      rule: detectedRule,
      toolsUsed: availableTools,
    });

    return {
      rule: detectedRule,
      ruleName: rule.name,
      response: assistantResponse,
      toolsUsed: availableTools,
    };
  },
});

// Helper function to generate response with Claude API
async function generateResponse(
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string,
  tools: string[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set in environment");
  }

  try {
    const fullSystemPrompt = buildSystemPrompt(systemPrompt, tools);
    return await callClaudeAPI(fullSystemPrompt, history, userMessage, apiKey);
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}

// Alternative: Direct tool execution for specific queries
export const executeToolQuery = action({
  args: {
    tool: v.string(),
    params: v.any(),
  },
  handler: async (ctx, args) => {
    // Map tool names to actual Convex queries
    const toolMap: Record<string, any> = {
      getSensorData: api.ai.tools.getSensorData,
      getLotInfo: api.ai.tools.getLotInfo,
      getPlanInfo: api.ai.tools.getPlanInfo,
      calculateROI: api.ai.tools.calculateROI,
      calculateGrowthMetrics: api.ai.tools.calculateGrowthMetrics,
      detectAnomalies: api.ai.tools.detectAnomalies,
      calculateStatistics: api.ai.tools.calculateStatistics,
    };

    const toolFn = toolMap[args.tool];
    if (!toolFn) {
      return { success: false, error: `Tool ${args.tool} not found` };
    }

    try {
      const result = await ctx.runQuery(toolFn, args.params);
      return result;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Claude API is now integrated. The generateResponse() function calls Claude
 * with the system prompt, conversation history, and available tools.
 * 
 * Make sure ANTHROPIC_API_KEY is set in your environment variables.
 */
