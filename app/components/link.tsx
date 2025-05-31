"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

interface Review {
  rating: number;
  text: string;
  date: string;
  dateObj?: Date;
}

export default function Link({ userId }: { userId: string }) {
  const router = useRouter();

  const gotoProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const linkId = uuidv4();
    const formData = new FormData(e.currentTarget);
    const link = formData.get("link") as string;
    await router.push(
      `/${linkId}?process=true&link=${encodeURIComponent(link)}`,
    );
  };

  return (
    <div className="bg-[#171717] w-[561.97px] rounded-[10px] px-[15px] py-[20px]">
      <form
        onSubmit={gotoProject}
        method="get"
        className="flex flex-row items-center w-full justify-between gap-4"
      >
        <input
          className="bg-[#171717] outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-medium placeholder:text-[16px] flex-1"
          type="text"
          name="link"
          autoComplete="off"
          placeholder="Paste Chrome webstore link here"
        />
        <button
          type="submit"
          className="cursor-pointer text-white font-medium py-2 px-4 rounded whitespace-nowrap"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
