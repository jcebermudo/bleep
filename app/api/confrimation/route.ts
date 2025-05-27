import { NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { slug, userId } = await request.json();
    const confirmation = await db
      .select()
      .from(project)
      .where(
        and(eq(project.project_uuid, slug), eq(project.user_uuid, userId)),
      );
    return NextResponse.json({ confirmation });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}
