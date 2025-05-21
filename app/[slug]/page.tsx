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
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    await db.update(project).set({
      name: dataInfo.info.name,
      icon: dataInfo.info.icon,
      description: dataInfo.info.description,
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
    await db.insert(reviews).values(dataReviews.reviews.map((review: Review) => ({
      project_id: confirmation[0].id,
      rating: review.rating,
      text: review.text,
      date: review.date,
    })));
  }

  return (
    <>
      <div>
        <h1>{confirmation[0].name}</h1>
        <p>{confirmation[0].description}</p>
      </div>
    </>
  );
}
