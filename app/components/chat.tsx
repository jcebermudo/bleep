"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState, useMemo } from "react";
import { div } from "motion/react-client";
import Markdown from "react-markdown";
import Image from "next/image";

export default function Chat({
  id,
  initialMessages,
}: { id?: string | undefined; initialMessages?: Message[] } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reasoning, setReasoning] = useState(false);

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
        (part) => part.type === "reasoning"
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
  }, [reasoning, messages, status]);

  // Track generation state
  useEffect(() => {
    setIsGenerating(status === "streaming");
  }, [status]);

  return (
    <div className="flex flex-col w-full pb-[200px] mx-auto stretch">
      {/* Debug info - remove in production */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-sm">
        Status: {status} | Reasoning: {reasoning.toString()} | Generating:{" "}
        {isGenerating.toString()}
      </div>

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
                {/* Show reasoning indicator */}
                {reasoning && (
                  <span className="text-yellow-500 text-sm">
                    🧠 Thinking...
                  </span>
                )}
              </div>
              <div className="mt-[10px]">
                {/* Show reasoning parts if they exist */}
                {m.parts?.filter((part) => part.type === "reasoning").length >
                  0 && (
                  <div className="flex flex-col p-[30px] bg-[#101010] outline-[1px] outline-[#2d2d2d] rounded-[20px] mb-[10px]">
                    <div className="text-sm text-gray-400 mb-2">Reasoning:</div>
                    {m.parts
                      ?.filter((part) => part.type === "reasoning")
                      .map((reasoningPart, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          {reasoningPart.reasoning}
                        </p>
                      ))}
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

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={isGenerating}
        />
      </form>
    </div>
  );
}
