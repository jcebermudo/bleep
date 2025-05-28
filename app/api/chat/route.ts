import { createTogetherAI } from '@ai-sdk/togetherai';
import { streamText } from "ai"

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages)

  const result = streamText({
    model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
    messages,
  });

  console.log(result)

  

  return result.toDataStreamResponse();
}
