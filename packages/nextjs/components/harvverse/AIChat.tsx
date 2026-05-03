"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

interface Message {
  _id: Id<"chatMessages">;
  role: "user" | "assistant";
  content: string;
  rule?: string;
  toolsUsed?: string[];
  createdAt: number;
}

interface AIChat {
  conversationId: string;
  lotCode?: string;
  title: string;
}

export function AIChat({ conversationId, lotCode, title }: AIChat) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const chatHistory = useQuery(api.ai.chat.getConversationHistory, {
    conversationId,
    limit: 50,
  });

  // Mutations
  const addMessage = useMutation(api.ai.chat.addMessage);

  // Load messages
  useEffect(() => {
    if (chatHistory) {
      console.log("Chat history updated:", chatHistory.length, "messages");
      console.log(
        "Messages:",
        chatHistory.map(m => ({ role: m.role, content: m.content.substring(0, 50) })),
      );
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      // Add user message
      console.log("Adding user message:", userMessage);
      await addMessage({
        conversationId,
        role: "user",
        content: userMessage,
      });

      // Call the chat API
      console.log("Calling chat API...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          conversationId,
          lotCode,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Chat API error: ${response.statusText} - ${errorText}`);
      }

      // Read the response as text (not streaming)
      const assistantMessage = await response.text();
      console.log("Full assistant message:", assistantMessage);

      // Add assistant message to database
      if (assistantMessage.trim()) {
        console.log("Saving assistant message to database...");
        try {
          const savedMsg = await addMessage({
            conversationId,
            role: "assistant",
            content: assistantMessage,
          });
          console.log("Message saved successfully:", savedMsg);

          // Update local state immediately with the new message
          const newMessage: Message = {
            _id: savedMsg._id as Id<"chatMessages">,
            role: "assistant",
            content: assistantMessage,
            createdAt: savedMsg.createdAt,
          };
          setMessages(prev => [...prev, newMessage]);
          console.log("Message added to UI");
        } catch (saveError) {
          console.error("Error saving message:", saveError);
          throw saveError;
        }
      } else {
        console.warn("Assistant message is empty!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      await addMessage({
        conversationId,
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
        <h2 className="font-semibold text-lg text-white">{title}</h2>
        {lotCode && <p className="text-sm text-slate-400">Lot: {lotCode}</p>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Start a conversation...</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message._id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-100 border border-slate-700"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.rule && <p className="text-xs mt-1 opacity-70">Rule: {message.rule}</p>}
                {message.toolsUsed && message.toolsUsed.length > 0 && (
                  <p className="text-xs mt-1 opacity-70">Tools: {message.toolsUsed.join(", ")}</p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 border border-slate-700 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-base-content rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-base-content rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-base-content rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2 rounded-b-xl flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about sensors, finances, or farm operations..."
          className="input input-bordered flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn btn-sm bg-cyan-600 hover:bg-cyan-700 border-0 text-white h-10"
        >
          Send
        </button>
      </form>
    </div>
  );
}
