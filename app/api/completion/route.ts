import { createTogetherAI } from '@ai-sdk/togetherai';
import { appendClientMessage, appendResponseMessages, streamText, extractReasoningMiddleware, wrapLanguageModel } from "ai"
import { loadChat, saveChat } from "@/tools/chat-store";
import { db } from "@/db";
import { analysis } from "@/db/schema";
import { eq } from "drizzle-orm";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
    console.log("it works")
  const { prompt }: { prompt: string } = await req.json();

  const enhancedModel = wrapLanguageModel({
    model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });

  const result = streamText({
    model: enhancedModel,
    prompt,
    async onFinish({ text }) {
      // Save the conversation to the database
      await db.insert(analysis).values({
        analysis: text,
      });
    },
  });

  result.consumeStream()

  return result.toDataStreamResponse();
}
