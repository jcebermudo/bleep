"use client";

import { useState } from "react";
import { generate } from "@/tools/testing";
import { readStreamableValue } from "ai/rsc";
import { ChevronDown, ChevronRight, Brain, MessageSquare } from "lucide-react";
import ThinkingDropdown from "../components/thinking-dropdown";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ParsedResponse {
  thinking: string;
  response: string;
  isThinkingComplete: boolean;
}

export default function Home() {
  const [generation, setGeneration] = useState<string>("");
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  const parseStreamingResponse = (text: string): ParsedResponse => {
    const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/;
    const match = text.match(thinkRegex);

    if (match) {
      const thinking = match[1].trim();
      const isThinkingComplete = match[2] === "</think>";
      const response = text.replace(/<think>[\s\S]*?(<\/think>|$)/, "").trim();

      return {
        thinking,
        response,
        isThinkingComplete,
      };
    }

    return {
      thinking: "",
      response: text.trim(),
      isThinkingComplete: true,
    };
  };

  const parsed = parseStreamingResponse(generation);

  const shouldShowThinkingContent = !parsed.isThinkingComplete || isThinkingExpanded;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4 overflow-y-auto">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={async () => {
          setGeneration(""); // Reset generation
          setIsThinkingExpanded(true); // Set expanded to true when starting generation
          const { output } = await generate("Why is the sky blue?");

          for await (const delta of readStreamableValue(output)) {
            setGeneration(
              (currentGeneration) => `${currentGeneration}${delta}`
            );
          }
        }}
      >
        Ask
      </button>

      {generation && (
        <>
          {/* Thinking Container */}
          <ThinkingDropdown
            title="Thoughts"
            isOpen={isThinkingExpanded || !parsed.isThinkingComplete}
            onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
          >
            {parsed.thinking}
          </ThinkingDropdown>

          {/* Response Container */}
          {parsed.response && (
            <div className="border border-blue-200 rounded-lg bg-blue-50">
              <div className="px-4 py-3 border-b border-blue-200 bg-blue-100 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Response</span>
                </div>
              </div>

              <div className="p-4">
                <div className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                  {parsed.response}
                  {parsed.isThinkingComplete && !parsed.response.trim() && (
                    <span className="text-gray-400 italic">
                      Generating response...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
