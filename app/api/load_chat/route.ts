// app/api/messages/route.ts
import { db } from "@/db";
import { chats } from "@/db/schema";
import { NextResponse } from "next/server";
import { loadChat } from "@/tools/chat-store";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();
    const chat = await loadChat(chatId);
    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error loading chat:", error);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}
