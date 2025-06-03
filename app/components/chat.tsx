"use client";

import React from "react";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import { div, p, span } from "motion/react-client";
import Markdown from "react-markdown";
import Image from "next/image";
import { motion } from "motion/react";

export default function Chat({
  id,
  initialMessages,
  link,
  isLinkLoading,
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
  const [isOpen, setIsOpen] = useState(false);
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
    });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Track reasoning state based on messages
  useEffect(() => {
    if (status != "streaming") {
      return;
    }
    if (messages.length === 0 || status !== "streaming") {
      setReasoning(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];

    // If the last message is from assistant and currently streaming
    if (lastMessage.role != "user" && status === "streaming") {
      const hasReasoningParts = lastMessage.parts?.some(
        (part) => part.type === "reasoning",
      );
      const hasContent =
        lastMessage.content && lastMessage.content.trim().length > 0;

      if (hasReasoningParts && !hasContent) {
        // Has reasoning but no content yet = currently reasoning
        setReasoning(true);
      } else if (hasContent) {
        // Has content = moved to response generation
        setReasoning(false);
      }
    } else {
      // Not streaming or not assistant message
      setReasoning(false);
    }
  }, [messages]);

  // Track generation state
  useEffect(() => {
    setIsGenerating(status === "streaming");
  }, [status, messages]);

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
                    <p className="font-medium text-[16px]">Thinking...</p>
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
                    <Markdown>{analysis}</Markdown>
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
                    <p className="font-medium text-[16px]">Bleep</p>
                  </div>

                  <div className="mt-[10px]">
                    <Markdown>{completion}</Markdown>
                  </div>
                </div>
              )}
              <div className="pb-[50px]">
                {messages.map((m) => (
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
                          <p className="font-medium text-[16px]">
                            Bleep{" "}
                            {status == "streaming" && (
                              <span> is thinking...</span>
                            )}
                          </p>
                        </div>
                        <div className="mt-[10px]">
                          {/* Show reasoning parts if they exist */}
                          {m.parts?.filter((part) => part.type === "reasoning")
                            .length > 0 && (
                            <div className="flex flex-col mb-[10px]">
                              <button
                                onClick={() => toggleMessageReasoning(m.id)}
                                className="cursor-pointer mt-[10px] font-medium text-[#B5B5B5] flex flex-row gap-[5px] items-center"
                              >
                                <span className="text-[16px]">Thoughts</span>
                                <Image
                                  className="mt-[3px]"
                                  src="/images/thoughtsdropdown.svg"
                                  alt="thoughtsdropdown"
                                  width={8}
                                  height={11}
                                />
                              </button>
                              {showReasoning[m.id] && (
                                <div>
                                  {m.parts
                                    ?.filter(
                                      (part) => part.type === "reasoning"
                                    )
                                    .map((reasoningPart, index) => (
                                      <p
                                        key={index}
                                        className="text-[14px] text-[#B5B5B5] mt-[10px]"
                                      >
                                        {reasoningPart.reasoning}
                                      </p>
                                    ))}
                                </div>
                              )}
                              {reasoning &&
                                messages.indexOf(m) === messages.length - 1 && (
                                  <div>
                                    <div className="overflow-hidden">
                                      {m.parts
                                        ?.filter(
                                          (part) => part.type === "reasoning"
                                        )
                                        .map((reasoningPart, index) => (
                                          <p
                                            key={index}
                                            className="text-[14px] text-[#B5B5B5]"
                                          >
                                            {reasoningPart.reasoning}
                                          </p>
                                        ))}
                                    </div>

                                    
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Show main response content */}
                          {m.content && (
                            <div className="">
                              <Markdown>{m.content}</Markdown>
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
                      <p className="font-medium text-[16px]">
                        Bleep is thinking...
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
