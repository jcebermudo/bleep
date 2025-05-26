"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { project, reviews } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getExtensionInfo } from "@/scraper/extensionInfo";
import { getLowRatedReviews } from "@/scraper/scrape";
import { newProject } from "@/scraper/newproject";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ process: string; link: string }>;
}) {
  let loading = true;
  const { slug } = await params;
  const { process, link } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    redirect("/login");
  }
  let officialInfo;
  let officialReviews;
  const confirmation = await db
    .select()
    .from(project)
    .where(
      and(eq(project.project_uuid, slug), eq(project.user_uuid, data.user.id)),
    );
  if (!confirmation.length) {
    if (process === "true") {
      const info = await getExtensionInfo(link);
      const newproject = await newProject(
        slug,
        data.user.id,
        link,
        info.name,
        info.icon,
        info.description,
      );
      officialInfo = info;
      const extractedReviews = await getLowRatedReviews(link);
      officialReviews = extractedReviews;
      await db.insert(reviews).values(
        extractedReviews.map((review) => ({
          project_id: newproject,
          rating: review.rating,
          text: review.text,
          date: review.date,
          days_ago_since_retrieval: review.daysAgoSinceRetrieval,
        })),
      );
    }
    loading = false;
  } else {
    const dbReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.project_id, confirmation[0].id));
    const dbInfo = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.project_uuid, slug),
          eq(project.user_uuid, data.user.id),
        ),
      );
    officialInfo = dbInfo[0];
    officialReviews = dbReviews;
    loading = false;
  }

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div>
            <h1>{officialInfo?.name}</h1>
            <p>{officialInfo?.description}</p>
          </div>
          <div>
            {officialReviews?.map((review, index: number) => (
              <div key={index}>
                <p>{review.text}</p>
                <p>{review.rating}</p>
                <p>{review.date}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
