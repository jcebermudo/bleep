// app/api/messages/route.ts
import { db } from "@/db";
import { chats } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    console.log("it works");
    const { projectId } = await req.json();
    const analysis = await db
      .select({
        analysis: chats.analysis,
      })
      .from(chats)
      .where(eq(chats.project_id, projectId));
    return NextResponse.json({ analysis: analysis[0].analysis });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 },
    );
  }
}
