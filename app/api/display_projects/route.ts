import { NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.user_uuid, userId)).orderBy(desc(project.created_at));
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}
