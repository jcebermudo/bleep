"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { div } from "motion/react-client";
import Markdown from "react-markdown";
import Image from "next/image";

export default function Chat({
  id,
  initialMessages,
}: { id?: string | undefined; initialMessages?: Message[] } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    id, // use the provided chat ID
    initialMessages, // initial messages if provided
    sendExtraMessageFields: true, // send id and createdAt for each message
    api: "/api/chat",
    // only send the last message to the server:
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id };
    },
  });
  return (
    <div className="flex flex-col w-full pb-[200px] mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id}>
          {/* Access reasoning from parts instead of reasoning property */}
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
              </div>
              <div className="mt-[10px]">
                {m.parts
                  ?.filter((part) => part.type === "reasoning")
                  .map((reasoningPart, index) => (
                    <p key={index}>{reasoningPart.reasoning}</p>
                  ))}
                <div className="">
                  <Markdown>{m.content}</Markdown>
                </div>
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
        />
      </form>
    </div>
  );
}
