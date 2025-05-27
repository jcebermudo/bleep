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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={gotoProject} method="get">
        <input
          className="border border-solid border-black bg-white text-black"
          type="text"
          name="link"
        />
        <button type="submit">Submit</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
