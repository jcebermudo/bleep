"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MainUI from "../components/mainui";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ process?: string; link?: string }>;
}) {
  const { slug } = await params;
  const { process, link } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    redirect("/login");
  }

  const sessionLink = JSON.parse(sessionStorage.getItem("link") || "{}").link;

  if (!sessionLink) {
    
  }

  return <MainUI slug={slug} userId={data.user.id} />;
}
