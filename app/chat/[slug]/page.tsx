"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Chat from "@/app/components/chat";
import { loadChat } from "@/tools/chat-store";

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

  const messages = await loadChat(slug);

  return <Chat id={slug} initialMessages={messages} />;
}
