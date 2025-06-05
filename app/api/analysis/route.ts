"use server";

import { streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { db } from "@/db/";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { prompt, chatId } = await req.json();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    const { textStream } = streamText({
      model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
      prompt: prompt,
      async onFinish({ text }) {
        console.log(text);
        await db.update(chats).set({ analysis: text }).where(eq(chats.id, chatId));
      },
    });

    try {
      for await (const delta of textStream) {
        await writer.write(encoder.encode(delta));
      }
    } finally {
      writer.close();
    }
  })();

  return new Response(stream.readable);
}
