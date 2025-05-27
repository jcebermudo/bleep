import { NextResponse } from "next/server";
import { db } from "@/db";
import { project, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { slug, userId } = await request.json();
    
    const getProject = await db
      .select()
      .from(project)
      .where(
        and(eq(project.project_uuid, slug), eq(project.user_uuid, userId)),
      );
    
    // Check if project exists
    if (!getProject || getProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    const getReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.project_id, getProject[0].id));
    
    return NextResponse.json({ 
      project: getProject[0], 
      reviews: getReviews 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}