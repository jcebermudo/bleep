// app/api/messages/route.ts
import { db } from "@/db";
import { messages } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMessages = await db
      .select()
      .from(messages)
      .orderBy(messages.createdAt);
    return NextResponse.json(allMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}