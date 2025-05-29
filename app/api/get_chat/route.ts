// app/api/messages/route.ts
import { db } from "@/db";
import { chats } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    const chat = await db.select().from(chats).where(eq(chats.project_id, projectId));
    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}