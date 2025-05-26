"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { db } from "@/db";
import { project } from "@/db/schema";
import { useRouter } from "next/navigation";

interface Review {
  rating: number;
  text: string;
  date: string;
  dateObj?: Date;
}

export default function Link({ userId }: { userId: string }) {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState({
    icon: "",
    name: "",
    description: "",
  });

  const gotoProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const linkId = uuidv4();
    const formData = new FormData(e.currentTarget);
    const link = formData.get("link") as string;
    const response = await fetch("/api/new_project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link, userId, linkId }),
    });
    if (!response.ok) {
      throw new Error("Failed to create project");
    }
    router.push(`/${linkId}`);
  };


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={gotoProject}>
        <input
          className="border border-solid border-black bg-white text-black"
          type="text"
          name="link"
        />
        <button type="submit">Submit</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="gap-16 flex flex-col">
        {reviews.map((review, index) => (
          <div key={index}>
            <p>{review.text}</p>
            <p>{review.rating}</p>
            <p>{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
