import { createTogetherAI } from '@ai-sdk/togetherai';
import { streamText } from "ai"

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
});

export async function POST(request: Request) {
    const { message } = await request.json();
    const response = await streamText({
        model: togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
        messages: [{role: "user", content: message}],
        system: "You are a helpful assistant that creates insights from reviews of Chrome extensions on the Chrome Webstore. These insights are then to be used by the user to generate business ideas through making Chrome extensions. You are to identify gaps and opportunities from the reviews of the Chrome extension and then generate insights based on that.",
    })
    
    return response
}
