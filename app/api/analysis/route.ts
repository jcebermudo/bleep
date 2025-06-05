"use server";

import { streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    const { textStream } = streamText({
      model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
      prompt: prompt,
      onFinish: ({ text }) => {
        console.log(text);
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
