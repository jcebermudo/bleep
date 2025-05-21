"use server";
import Link from "./components/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    redirect("/login");
  }
  return <Link userId={data.user.id}/>;
}
