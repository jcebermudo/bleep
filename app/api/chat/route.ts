import { createTogetherAI } from "@ai-sdk/togetherai";
import {
  appendClientMessage,
  appendResponseMessages,
  streamText,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { loadChat, saveChat } from "@/tools/chat-store";
import { db } from "@/db"
import { chats } from "@/db/schema"
import { eq } from "drizzle-orm";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, id, analysisText } = await req.json();

  const previousMessages = await loadChat(id);

  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const enhancedModel = wrapLanguageModel({
    model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });

  const result = streamText({
    model: enhancedModel,
    // ... existing code ...
    system: `You are Bleep, an AI that analyzes Chrome Web Store extension reviews to generate actionable product insights. For casual messages like greetings, thanks, or pleasantries, respond briefly and naturally without analysis. For questions about extension reviews and product insights, provide detailed analysis based on this report: ${analysisText}`,
// ... existing code ...,
    messages,
    async onFinish({ response }) {
      // Save the conversation to the database
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages: [message],
          responseMessages: response.messages,
        }),
      });
    },
  });

  result.consumeStream();

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
