// app/api/messages/route.ts
import { db } from "@/db";
import { chats } from "@/db/schema";
import { NextResponse } from "next/server";
import { createChat } from "@/tools/chat-store";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    const chatId = await createChat(projectId);
    return NextResponse.json({ chatId });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}