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
    <div className="w-full h-full flex items-center px-[10px] justify-center bg-black">
      <div className="bg-amber-500 w-full overflow-auto">
        <div className="flex flex-col items-center">
          <h1 className="text-[32px] font-medium">
            Generate Chrome extension ideas
          </h1>
          <p className="text-[16px] font-medium m-[10px] text-[#B5B5B5] max-w-[468.47px] text-center">
            Collect bad reviews from any Chrome extension and use AI to get
            useful insights and new product ideas.
          </p>
          <Link userId={data.user.id}/>
        </div>
      </div>
    </div>
  );
}
