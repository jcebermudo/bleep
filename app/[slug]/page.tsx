"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MainUI from "../components/mainui";
import Image from "next/image";
import User from "../components/user";
import Link from "next/link";

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

  return (
    <div className="w-full min-h-screen flex flex-col bg-black px-[10px]">
      <div className="w-full flex flex-row justify-between items-center mt-[10px]">
        <Link href="/">
          <Image
            className="select-none"
            src="/images/BLEEP-LOGO.svg"
            alt="bleep-logo"
            width={90}
            height={26.2}
          />
        </Link>
        <div className="flex flex-row items-center">
          <User
            userId={data.user.id}
            avatar_url={data.user.user_metadata.avatar_url}
            name={data.user.user_metadata.name}
            email={data.user.user_metadata.email}
          />
        </div>
      </div>
      <MainUI slug={slug} userId={data.user.id} />
    </div>
  );
}
