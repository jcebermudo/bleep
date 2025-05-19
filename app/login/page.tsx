"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Google from "@/app/components/google";

export default async function Auth() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    redirect("/");
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Google />
    </div>
  );
}
