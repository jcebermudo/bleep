"use server";

import { streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createStreamableValue } from "ai/rsc";
import { NextResponse } from "next/server";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = streamText({
      model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
      prompt: prompt,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return NextResponse.json({ output: stream });
}
