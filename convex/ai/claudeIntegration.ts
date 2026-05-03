export async function callClaudeAPI(
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const messages = [
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.content[0];
  
  if (content.type === "text") {
    return content.text;
  }

  return "Unable to generate response";
}

export function buildSystemPrompt(
  basePrompt: string,
  tools: string[]
): string {
  const toolsList = tools.length > 0
    ? `\n\nAvailable tools:\n${tools.map((t) => `- ${t}`).join("\n")}`
    : "";

  return `${basePrompt}${toolsList}

When answering questions:
1. Use the available tools to gather specific data
2. Provide data-driven recommendations with specific numbers
3. Cite the data sources you're using
4. Explain your reasoning clearly
5. If you need more information, ask for clarification
6. Respond in Spanish when appropriate for the context`;
}
