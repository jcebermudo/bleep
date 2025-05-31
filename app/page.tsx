"use server";
import Link from "./components/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Projects from "./components/projects";
import Image from "next/image"
import * as motion from "motion/react-client";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    redirect("/login");
  }
  return (
    <div className="w-full h-full flex flex-col items-center px-[10px] justify-center bg-black">
      <div className="rounded-t-[20px] outline-[1px] outline-[#2D2D2D] bg-[#070707] w-full h-screen overflow-y-auto">
        <div className="flex flex-col items-center mt-[100px]">
          <div className="relative">
              <motion.div
        className="select-none absolute translate-x-[120%] translate-y-[40%]"
        animate={{
          y: [-8, 8, -8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Image
          src="/images/puzzle.svg"
          alt="puzzle"
          width={216.38}
          height={166.04}
        />
      </motion.div>
            <Image
              className="select-none"
              src="/images/graph-website.svg"
              alt="graph"
              width={692.82}
              height={400}
            />
          </div>
          <div className="mt-[-120px] flex flex-col items-center z-[10]">
            <h1 className="text-[32px] font-medium">
              Generate Chrome extension ideas
            </h1>
            <p className="text-[16px] font-medium m-[10px] text-white max-w-[468.47px] text-center">
              Collect bad reviews from any Chrome extension and use AI to get
              useful insights and new product ideas.
            </p>
            <Link userId={data.user.id} />
          </div>
          <div className="mt-[30px] flex flex-col items-center">
            <Projects userId={data.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
