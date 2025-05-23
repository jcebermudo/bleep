"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { project, reviews } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface Review {
  rating: number;
  text: string;
  date: string;
  daysAgoSinceRetrieval: number;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
    let loading = true;
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    redirect("/login");
  }
  const confirmation = await db
    .select({
      id: project.id,
      name: project.name,
      icon: project.icon,
      description: project.description,
      link: project.extension_link,
    })
    .from(project)
    .where(
      and(eq(project.project_uuid, slug), eq(project.user_uuid, data.user.id)),
    );
    const link = confirmation[0].link;
    let officialInfo;
    let officialReviews;
  if (!confirmation[0].name && !confirmation[0].icon && !confirmation[0].description) {
    const responseInfo = await fetch("/api/scrape_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link }),
    });

    if (!responseInfo.ok) {
      throw new Error("Failed to fetch info");
    }
    const dataInfo = await responseInfo.json();
    officialInfo = dataInfo.info;
    await db.update(project).set({
      name: officialInfo.name,
      icon: officialInfo.icon,
      description: officialInfo.description,
    }).where(
      and(eq(project.project_uuid, slug), eq(project.user_uuid, data.user.id)),
    );
    const responseReviews = await fetch("/api/scrape_reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link }),
    });

    if (!responseReviews.ok) {
      throw new Error("Failed to fetch reviews");
    }
    const dataReviews = await responseReviews.json();
    officialReviews = dataReviews.reviews;
    await db.insert(reviews).values(officialReviews.map((review: Review) => ({
      project_id: confirmation[0].id,
      rating: review.rating,
      text: review.text,
      date: review.date,
      days_ago_since_retrieval: review.daysAgoSinceRetrieval,
    })));
    loading = false;
  } else {
    const dbReviews = await db.select().from(reviews).where(eq(reviews.project_id, confirmation[0].id));
    const dbInfo = await db.select().from(project).where(and(eq(project.project_uuid, slug), eq(project.user_uuid, data.user.id)));
    officialInfo = dbInfo[0];
    officialReviews = dbReviews;
    loading = false;
  }

  return (
    <>
      <div>
        <h1>{officialInfo.name}</h1>
        <p>{officialInfo.description}</p>
      </div>
      <div>
        {officialReviews.map((review: Review, index: number) => (
          <div key={index}>
            <p>{review.text}</p>
            <p>{review.rating}</p>
            <p>{review.date}</p>
          </div>
        ))}
      </div>
    </>
  );
}
