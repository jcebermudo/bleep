import { NextResponse } from "next/server";
import { db } from "@/db";
import { project, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { link, userId } = await request.json();
    const getProject = await db
      .select()
      .from(project)
      .where(
        and(eq(project.extension_link, link), eq(project.user_uuid, userId)),
      );
    const getReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.project_id, getProject[0].id));
    return NextResponse.json({ project: getProject[0], reviews: getReviews });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}
