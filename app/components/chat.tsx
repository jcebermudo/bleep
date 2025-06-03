"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState, useMemo } from "react";
import { div } from "motion/react-client";
import Markdown from "react-markdown";
import Image from "next/image";

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
  const [showReasoning, setShowReasoning] = useState(false);

  const { input, handleInputChange, handleSubmit, messages, status } = useChat({
    id, // use the provided chat ID
    initialMessages, // initial messages if provided
    sendExtraMessageFields: true, // send id and createdAt for each message
    api: "/api/chat",
    // only send the last message to the server:
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id };
    },
  });

  // Track reasoning state based on messages
  useEffect(() => {
    if (messages.length === 0) {
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
  }, [status]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-row justify-center items-center">
        <div className="flex flex-col mx-auto max-w-[850px]">
          {/* Debug info - remove in production */}
          <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-sm">
            Status: {status} | Reasoning: {reasoning.toString()} | Generating:{" "}
            {isGenerating.toString()}
          </div>
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {isLinkLoading ? (
              <div className="w-full flex flex-row justify-end mt-[20px]">
                <p className="font-normal text-[16px] text-left px-[15px] py-[20px] bg-[#171717] rounded-[20px] max-w-[500px]">
                  loading link
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-row justify-end mt-[20px]">
                <p className="font-normal text-[16px] text-left px-[15px] py-[20px] bg-[#171717] rounded-[20px] max-w-[500px]">
                  {link}
                </p>
              </div>
            )}
            {chatLoading ? (
              <p>Loading chat...</p>
            ) : (
              <>
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
                          <p className="font-medium text-[16px]">Bleep</p>
                          {/* Show reasoning indicator only for the most recent AI message */}
                          {reasoning &&
                            messages.indexOf(m) === messages.length - 1 && (
                              <span className="text-yellow-500 text-sm">
                                🧠 Thinking...
                              </span>
                            )}
                        </div>
                        <div className="mt-[10px]">
                          {/* Show reasoning parts if they exist */}
                          {m.parts?.filter((part) => part.type === "reasoning")
                            .length > 0 && (
                            <div className="flex flex-col p-[20px] bg-[#101010] outline-[1px] outline-[#2d2d2d] rounded-[20px] mb-[10px]">
                              <button
                                onClick={() => setShowReasoning(!showReasoning)}
                                className="font-medium text-[14px] text-[#B5B5B5] mb-2 flex flex-row gap-[5px] items-center"
                              >
                                <span>Thoughts</span>
                                <Image
                                  src="/images/thoughtsdropdown.svg"
                                  alt="thoughtsdropdown"
                                  width={5}
                                  height={11}
                                />
                              </button>
                              {showReasoning && (
                                <div>
                                  {m.parts
                                    ?.filter(
                                      (part) => part.type === "reasoning",
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
                              )}
                              {reasoning &&
                                messages.indexOf(m) === messages.length - 1 && (
                                  <div>
                                    {m.parts
                                      ?.filter(
                                        (part) => part.type === "reasoning",
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
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-row justify-center items-center">
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            className="bg-[#171717] resize-none font-normal outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-normal placeholder:text-[16px] w-full pr-8 overflow-hidden"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            disabled={isGenerating}
            rows={1}
          />
          <div className="w-full flex items-end justify-end">
            <button
              type="submit"
              className="cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270"
            >
              <Image
                src="/images/arrow.svg"
                alt="arrow"
                width={17}
                height={17}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
