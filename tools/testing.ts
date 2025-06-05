"use server";

import { streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createStreamableValue } from "ai/rsc";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
});

export async function generate(input: string) {
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = streamText({
      model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
