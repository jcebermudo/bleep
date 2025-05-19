"use client";
import { useState } from "react";

interface Review {
  rating: number;
  text: string;
  date: string;
  dateObj?: Date;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const link = formData.get("link") as string;
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      setError("Failed to fetch reviews");
    } finally {
      setLoading(false);
      console.log(loading);
      console.log(error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={handleSubmit}>
        <input type="text" name="link" />
        <button type="submit">Submit</button>
      </form>
      {reviews.map((review, index) => (
        <div key={index}>
          <p>{review.text}</p>
          <p>{review.rating}</p>
          <p>{review.date}</p>
        </div>
      ))}
    </div>
  );
}
