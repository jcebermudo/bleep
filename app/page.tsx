"use server";

import { getLowRatedReviews } from "@/scraper/scrape";

export default async function Home() {
  const reviews = await getLowRatedReviews("https://chromewebstore.google.com/detail/Sound%20Booster%20-%20increase%20volume%20up/nmigaijibiabddkkmjhlehchpmgbokfj");
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
