"use client";

import { useState } from "react";
import { generate } from "@/tools/testing";
import { readStreamableValue } from "ai/rsc";
import { ChevronDown, ChevronRight, Brain, MessageSquare } from "lucide-react";

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={async () => {
          setGeneration(""); // Reset generation
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
          {parsed.thinking && (
            <div className="border border-amber-200 rounded-lg bg-amber-50">
              <button
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100 rounded-t-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-800">
                    Thinking Process
                    {!parsed.isThinkingComplete && (
                      <span className="ml-2 text-xs bg-amber-200 px-2 py-1 rounded animate-pulse">
                        streaming...
                      </span>
                    )}
                  </span>
                </div>
                {isThinkingExpanded ? (
                  <ChevronDown className="w-5 h-5 text-amber-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-amber-600" />
                )}
              </button>

              {isThinkingExpanded && (
                <div className="px-4 pb-4 border-t border-amber-200">
                  <div className="mt-3 text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {parsed.thinking}
                    {!parsed.isThinkingComplete && (
                      <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
