"use client";

import React from "react";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import { div, p, span } from "motion/react-client";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { motion } from "motion/react";
import ThinkingDropdown from "./thinking-dropdown";

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

export default function Chat({
  id,
  initialMessages,
  link,
  analysis,
  completion,
  existingAnalysis,
  chatLoading,
}: {
  id?: string | undefined;
  initialMessages?: Message[];
  link?: string;
  isLinkLoading?: boolean;
  analysis?: string;
  completion?: string;
  existingAnalysis?: boolean;
  chatLoading?: boolean;
} = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reasoning, setReasoning] = useState(false);
  // Changed: Use object to track each message's dropdown state
  const [showReasoning, setShowReasoning] = useState<{
    [key: string]: boolean;
  }>({});
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { input, handleInputChange, handleSubmit, messages, status, stop } =
    useChat({
      id, // use the provided chat ID
      initialMessages, // initial messages if provided
      sendExtraMessageFields: true, // send id and createdAt for each message
      api: "/api/chat",
      // only send the last message to the server:
      experimental_prepareRequestBody({ messages, id }) {
        return { message: messages[messages.length - 1], id };
      },
      experimental_throttle: 50,
    });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [status]);

  useEffect(() => {
    if (!chatLoading && chatContainerRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chatLoading]);

  // Track generation state
  useEffect(() => {
    setIsGenerating(status === "streaming");
  }, [status]);

  // Helper function to toggle specific message dropdown
  const toggleMessageReasoning = (messageId: string) => {
    setShowReasoning((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div
        className="w-full h-screen flex flex-row justify-center items-center px-[30px] overflow-y-auto"
        ref={chatContainerRef}
      >
        <div className="flex flex-col mx-auto w-full max-w-[700px]">
          {/* Debug info - remove in production */}
          <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-sm">
            Status: {status} | Reasoning: {reasoning.toString()} | Generating:{" "}
            {isGenerating.toString()}
          </div>
          {chatLoading ? (
            <p>Loading chat...</p>
          ) : (
            <div className="h-[calc(100vh-200px)]">
              <div className="w-full flex flex-row justify-end mt-[20px]">
                <p className="font-normal text-[16px] text-left px-[15px] py-[20px] bg-[#171717] rounded-[20px] max-w-[500px]">
                  {link}
                </p>
              </div>
              {completion == undefined && (
                <div className="mt-[20px]">
                  <div className="flex flex-row items-center gap-[8px]">
                    <Image
                      src="/images/bleep.svg"
                      alt="bleep"
                      width={25}
                      height={25}
                    />
                    <p className="font-medium text-[16px] flex items-center">
                      Thinking<span className="thinking-text"></span>
                      <style jsx>{styles}</style>
                    </p>
                  </div>
                </div>
              )}
              {existingAnalysis ? (
                <div className="mt-[20px]">
                  <div className="flex flex-row items-center gap-[8px]">
                    <Image
                      src="/images/bleep.svg"
                      alt="bleep"
                      width={25}
                      height={25}
                    />
                    <p className="font-medium text-[16px]">Bleep</p>
                  </div>
                  <div className="mt-[10px]">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="mt-[20px]">
                  <div className="flex flex-row items-center gap-[8px]">
                    <Image
                      src="/images/bleep.svg"
                      alt="bleep"
                      width={25}
                      height={25}
                    />

                    {status === "streaming" &&
                    messages.length > 0 &&
                    messages[messages.length - 1].role !== "user" &&
                    messages[messages.length - 1].parts?.some(
                      (part) => part.type === "reasoning"
                    ) &&
                    !(
                      messages[messages.length - 1].content?.trim().length > 0
                    ) ? (
                      <p className="font-medium text-[16px] flex items-center">
                        Thinking<span className="thinking-text"></span>
                        <style jsx>{styles}</style>
                      </p>
                    ) : (
                      <p className="font-medium text-[16px]">Bleep</p>
                    )}
                  </div>

                  <div className="mt-[10px]">
                    <ReactMarkdown>{completion}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div className="pb-[50px]">
                {messages.map((m, index) => (
                  <div key={m.id}>
                    {m.role == "user" ? (
                      <div className="w-full flex flex-row justify-end mt-[20px]">
                        <p className="font-normal text-[16px] text-left px-[15px] py-[20px] bg-[#171717] rounded-[20px] max-w-[500px]">
                          {m.content}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-[20px]">
                        <div className="flex flex-row items-center gap-[8px]">
                          <Image
                            src="/images/bleep.svg"
                            alt="bleep"
                            width={25}
                            height={25}
                          />
                          {/* Only show "Thinking..." for the most recent AI message */}
                          {(status === "streaming" &&
                            index === messages.length - 1 && // This is the most recent message
                            m.role === "assistant") ||
                          (index === messages.length - 1 && // This is the most recent message
                            m.role === "assistant" &&
                            m.parts?.some(
                              (part) => part.type === "reasoning"
                            ) &&
                            !(m.content?.trim().length > 0)) ? (
                            <p className="font-medium text-[16px] flex items-center">
                              Thinking<span className="thinking-text"></span>
                              <style jsx>{styles}</style>
                            </p>
                          ) : (
                            <p className="font-medium text-[16px]">Bleep</p>
                          )}
                        </div>
                        <div className="mt-[10px]">
                          {/* Show reasoning parts if they exist */}
                          {m.parts?.filter((part) => part.type === "reasoning")
                            .length > 0 && (
                            <div>
                              {m.parts
                                ?.filter((part) => part.type === "reasoning")
                                .map((reasoningPart, reasoningIndex) => (
                                  <ThinkingDropdown
                                    key={reasoningIndex}
                                    title="Thoughts"
                                    isOpen={
                                      showReasoning[m.id] ||
                                      (status === "streaming" &&
                                        index === messages.length - 1 && // Only for the most recent message
                                        m.role !== "user" &&
                                        m.parts?.some(
                                          (part) => part.type === "reasoning"
                                        ) &&
                                        !(m.content?.trim().length > 0))
                                    }
                                    onToggle={() =>
                                      toggleMessageReasoning(m.id)
                                    }
                                  >
                                    {reasoningPart.reasoning}
                                  </ThinkingDropdown>
                                ))}
                            </div>
                          )}

                          {/* Show main response content */}
                          {m.content && (
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
                                    <hr
                                      className="border-[#303030] my-[20px]"
                                      {...props}
                                    />
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
                                {m.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {status === "submitted" ? (
                  <div className="mt-[20px]">
                    <div className="flex flex-row items-center gap-[8px]">
                      <Image
                        src="/images/bleep.svg"
                        alt="bleep"
                        width={25}
                        height={25}
                      />
                      <p className="font-medium text-[16px] flex items-center">
                        Thinking<span className="thinking-text"></span>
                        <style jsx>{styles}</style>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col justify-center items-center px-[20px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="w-full max-w-[750px] bg-[#171717] rounded-[20px] p-[15px] mb-[50px]"
        >
          <textarea
            className="resize-none font-normal outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-normal placeholder:text-[16px] w-full pr-8 h-[50px]"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={isGenerating || isChatDisabled}
            rows={1}
          />
          <div className="w-full flex items-end justify-end">
            {(status === "submitted" || status === "streaming") && (
              <button
                type="button"
                onClick={() => stop()}
                disabled={!(status === "submitted" || status === "streaming")}
                className={
                  !(status === "submitted" || status === "streaming")
                    ? "cursor-not-allowed bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270 opacity-50"
                    : "cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270"
                }
              >
                <Image
                  src="/images/block.svg"
                  alt="stop"
                  width={17}
                  height={17}
                />
              </button>
            )}
            {status != "submitted" && status != "streaming" && (
              <button
                type="submit"
                disabled={isChatDisabled || !input.trim()}
                className={
                  isChatDisabled || !input.trim()
                    ? "cursor-not-allowed bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270 opacity-50"
                    : "cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270"
                }
              >
                <Image
                  src="/images/arrow.svg"
                  alt="arrow"
                  width={17}
                  height={17}
                />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
