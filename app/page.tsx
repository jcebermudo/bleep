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
  return (
    <>
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-[32px] font-medium">
        Generate Chrome extension ideas
      </h1>
      <p className="text-[16px] font-normal">
        Collect bad reviews from any Chrome extension and use AI to get useful
        insights and new product ideas.
      </p>
      <Link userId={data.user.id} />
    </div>
    </>
  );
}
