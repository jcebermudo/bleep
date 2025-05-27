import { NextResponse } from "next/server";
import { getLowRatedReviews } from "@/scraper/scrape";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { link, projectId } = await request.json();
    const fetchReviews = await getLowRatedReviews(link);
    const postReviews = await db.insert(reviews).values(
      fetchReviews.map((review) => ({
        project_id: projectId,
        rating: review.rating,
        text: review.text,
        date: review.date,
        days_ago_since_retrieval: review.daysAgoSinceRetrieval,
      }))
    );
    return NextResponse.json({ fetchReviews });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
