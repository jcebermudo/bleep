"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MainUI from "../components/mainui";
import getExisting from "@/tools/get-existing";
import { type Project, type Review } from "@/db/schema";
import { type Message } from "ai";

async function fetchUserAndProject(slug: string) {
  const supabase = await createClient();

  // Run auth check and data fetch in parallel
  const [{ data }, existing] = await Promise.all([
    supabase.auth.getUser(),
    getExisting(slug),
  ]);

  if (!data?.user) {
    redirect("/login");
  }

  return { user: data.user, existing };
}


export default async function PageOptimized({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Parallel execution
  const { user, existing } = await fetchUserAndProject(slug);

  // Simplified data preparation
  const fetchedData = {
    project: existing.project,
    reviews: existing.reviews || [],
    analysis: existing.analysis,
    messages: existing.messages || [],
    link: existing.project?.extension_link || null,
  };

  return (
    <MainUI
      slug={slug}
      userId={user.id}
      fetchedProject={fetchedData.project}
      fetchedReviews={fetchedData.reviews}
      fetchedAnalysis={fetchedData.analysis}
      fetchedMessages={fetchedData.messages}
      exists={!!fetchedData.project}
      link={fetchedData.link}
    />
  );
}