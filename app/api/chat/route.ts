import { createTogetherAI } from '@ai-sdk/togetherai';
import { appendClientMessage, appendResponseMessages, streamText, extractReasoningMiddleware, wrapLanguageModel } from "ai"
import { loadChat, saveChat } from "@/tools/chat-store";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, id } = await req.json();

  const previousMessages = await loadChat(id);

  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const enhancedModel = wrapLanguageModel({
    model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });

  const result = streamText({
    model: enhancedModel,
    messages,
    async onFinish({ response, reasoning }) {
      
      // Save the conversation to the database
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages: [message],
          responseMessages: response.messages,
        }),
        reasoning: reasoning || undefined
      })
    },
  });

  result.consumeStream()

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
