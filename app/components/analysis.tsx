"use client";

import { useState, useEffect } from "react";
import { generate } from "@/tools/testing";
import { readStreamableValue } from "ai/rsc";
import { ChevronDown, ChevronRight, Brain, MessageSquare } from "lucide-react";
import ThinkingDropdown from "../components/thinking-dropdown";
import { motion, AnimatePresence, m } from "motion/react";
import ReactMarkdown from "react-markdown";
import { div } from "motion/react-client";
import Image from "next/image";
import { is } from "drizzle-orm";

const styles = `
  @keyframes ellipsis {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
  .thinking-text::after {
    content: '...';
    animation: ellipsis 1.5s infinite;
    display: inline-block;
    width: 1.5em;
    text-align: left;
  }
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ParsedResponse {
  thinking: string;
  response: string;
  isThinkingComplete: boolean;
}

export default function Analysis({
  analysis,
  generation,
}: {
  analysis: string;
  generation: string;
}) {
  console.log("Analysis component props:", {
    analysis: analysis || "(empty string)",
    generation: generation || "(empty string)",
    analysisLength: analysis?.length || 0,
    generationLength: generation?.length || 0,
  });

  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  let isThinkingCompleteUI = false;
  
  const parseStreamingResponse = (text: string): ParsedResponse => {
    // First check if this is a pre-existing analysis without any think tags
    if (!text.includes("<think>")) {
      return {
        thinking: "", // No thinking content for pre-existing analysis
        response: text.trim(),
        isThinkingComplete: true, // Mark as complete since it's pre-existing
      };
    }

    // Handle streaming response with think tags
    const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/;
    const match = text.match(thinkRegex);

    if (match) {
      const thinking = match[1].trim();
      const isThinkingComplete = match[2] === "</think>";
      isThinkingCompleteUI = isThinkingComplete;
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

    const parsed = parseStreamingResponse(
      analysis?.trim() ? analysis : generation?.trim() ? generation : ""
    );

  const shouldShowThinkingContent =
    !parsed.isThinkingComplete || isThinkingExpanded;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94, // Start from bottom
      }}
      animate={{
        opacity: 1,
        scale: 1, // Slide up to top
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: {
          duration: 0.5,
          ease: "easeInOut",
          delay: 0.1,
        }, // Duration for the slide up
      }}
      className="mt-[20px] max-w-4xl p-[30px] space-y-4 overflow-y-auto bg-[#171717] outline-[1px] outline-[#2D2D2D] rounded-[20px]"
    >
      <div className="flex flex-row items-center gap-[8px]">
        <Image src="/images/bleep.svg" alt="bleep" width={25} height={25} />
        {/* Only show "Thinking..." for the most recent AI message */}
        {!isThinkingCompleteUI ? (
          <p className="font-medium text-[16px] flex items-center">
            Making your report<span className="thinking-text"></span>
            <style jsx>{styles}</style>
          </p>
        ) : (
          <p className="font-medium text-[16px]">Bleep</p>
        )}
      </div>
      {analysis && analysis.trim() && (
        <div>
          <div className="mt-[10px]">
            <ThinkingDropdown
              title="Thoughts"
              isOpen={isThinkingExpanded}
              onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
            >
              <div className="whitespace-pre-wrap items-center gap-2">
                {parsed.thinking}
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
                {parsed.response}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {generation && !analysis?.trim() && (
        <div>
          <div className="mt-[10px]">
            <ThinkingDropdown
              title="Thoughts"
              isOpen={isThinkingExpanded || !parsed.isThinkingComplete}
              onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
            >
              <div className="whitespace-pre-wrap items-center gap-2">
                {parsed.thinking}
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
                {parsed.response}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
