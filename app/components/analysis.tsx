"use client";

import { useState } from "react";
import { generate } from "@/tools/testing";
import { readStreamableValue } from "ai/rsc";
import { ChevronDown, ChevronRight, Brain, MessageSquare } from "lucide-react";
import ThinkingDropdown from "../components/thinking-dropdown";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ParsedResponse {
  thinking: string;
  response: string;
  isThinkingComplete: boolean;
}

export default function Analysis({
  analysis,
  prompt,
}: {
  analysis?: string;
  prompt?: string;
}) {
  const [generation, setGeneration] = useState<string>("");
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isResponseComplete, setIsResponseComplete] = useState(false);

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

  const parsed = parseStreamingResponse(analysis ?? generation);

  const shouldShowThinkingContent =
    !parsed.isThinkingComplete || isThinkingExpanded;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4 overflow-y-auto">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={async () => {
          setGeneration(""); // Reset generation
          const { output, isComplete } = await generate(
            "Why is albert einstein so smart?"
          );

          if (isComplete) {
            setIsResponseComplete(true);
          }

          for await (const delta of readStreamableValue(output)) {
            setGeneration(
              (currentGeneration) => `${currentGeneration}${delta}`
            );
          }
        }}
      >
        Ask
      </button>

      {analysis && (
        <div className="mt-[10px]">
          <ThinkingDropdown
            title="Thoughts"
            isOpen={isThinkingExpanded}
            onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
          >
            <div className="whitespace-pre-wrap items-center gap-2 leading-relaxed">
              {analysis}
            </div>
          </ThinkingDropdown>
          <div className="mt-[10px]">
            <ReactMarkdown
              components={{
                p: (props) => (
                  <p
                    className="text-[16px] font-normal text-white"
                    {...props}
                  />
                ),
                hr: (props) => (
                  <hr className="border-[#303030] my-[20px]" {...props} />
                ),
                h1: (props) => (
                  <h1
                    className="text-[24px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                h2: (props) => (
                  <h2
                    className="text-[20px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                h3: (props) => (
                  <h3
                    className="text-[18px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                h4: (props) => (
                  <h4
                    className="text-[16px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                h5: (props) => (
                  <h5
                    className="text-[14px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                h6: (props) => (
                  <h6
                    className="text-[12px] font-medium text-white mb-[10px]"
                    {...props}
                  />
                ),
                li: (props) => (
                  <li
                    className="text-[16px] font-normal text-white mb-[10px]"
                    {...props}
                  />
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {generation && !analysis && (
        <>
          {/* Thinking Container */}
          <ThinkingDropdown
            title="Thoughts"
            isOpen={isThinkingExpanded || !parsed.isThinkingComplete}
            onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
          >
            <div className="whitespace-pre-wrap items-center gap-2 leading-relaxed">
              {parsed.thinking}
            </div>
          </ThinkingDropdown>

          {/* Response Container */}
          {parsed.response && (
            <div className="mt-[10px]">
              <ReactMarkdown
                components={{
                  p: (props) => (
                    <p
                      className="text-[16px] font-normal text-white"
                      {...props}
                    />
                  ),
                  hr: (props) => (
                    <hr className="border-[#303030] my-[20px]" {...props} />
                  ),
                  h1: (props) => (
                    <h1
                      className="text-[24px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  h2: (props) => (
                    <h2
                      className="text-[20px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  h3: (props) => (
                    <h3
                      className="text-[18px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  h4: (props) => (
                    <h4
                      className="text-[16px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  h5: (props) => (
                    <h5
                      className="text-[14px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  h6: (props) => (
                    <h6
                      className="text-[12px] font-medium text-white mb-[10px]"
                      {...props}
                    />
                  ),
                  li: (props) => (
                    <li
                      className="text-[16px] font-normal text-white mb-[10px]"
                      {...props}
                    />
                  ),
                }}
              >
                {parsed.response}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
}
