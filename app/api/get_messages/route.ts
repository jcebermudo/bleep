import { loadChat, saveChat } from "@/tools/chat-store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();
  console.log(chatId);
  const chatmessages = await loadChat(chatId);
  return NextResponse.json({ chatmessages });
}
