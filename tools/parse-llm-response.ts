export interface ParsedLLMResponse {
  thinking: string;
  response: string;
  isThinkingComplete: boolean;
}

export function parseLLMResponse(text: string): ParsedLLMResponse {
  const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/;
  const match = text.match(thinkRegex);

  if (match) {
    const thinking = match[1].trim();
    const isThinkingComplete = match[2] === "</think>";
    const response = text.replace(/<think>[\s\S]*?(<\/think>|$)/, "").trim();

    return {
      thinking,
      response,
      isThinkingComplete,
    };
  }

  return {
    thinking: "",
    response: text.trim(),
    isThinkingComplete: true,
  };
} 