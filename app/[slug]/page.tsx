"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MainUI from "../components/mainui";

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

  return <MainUI slug={slug} userId={data.user.id}/>;
}
