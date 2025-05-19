import puppeteer, { ElementHandle } from "puppeteer";
import { setTimeout } from "node:timers/promises";
import dayjs from "dayjs";

interface Review {
  rating: number;
  text: string;
  date: string;
  daysAgoSinceRetrieval: number;
}

async function getLowRatedReviews(link: string) {
  const dayjs = require("dayjs");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${link}/reviews`);
  await page.waitForSelector(".T7rvce");

  let lowRatedReviews: Review[] = [];
  let attempts = 0;
  const maxAttempts = 20; // Maximum attempts to load more reviews
  let foundRecentLowRated = false;
  let firstAttempt = true;

  try {
    // Wait for reviews to load
    await page.waitForSelector(".T7rvce");
    while (attempts < maxAttempts) {
      const elementExists = await page.waitForSelector('[jsname="Btxakc"]');
      if (elementExists) {
        await page.locator('[jsname="Btxakc"]').click();
        attempts++;
        console.log(attempts);
      } else {
        console.log("cant do nomo bro");
        break;
      }

      await setTimeout(1000);
    }
    // Extract reviews from the current page
    const pageReviews = await page.$$eval(".T7rvce", (items) => {
      function convertDateFormat(dateString: string): string {
        // Map of month abbreviations to their numerical values
        const monthMap: Record<string, string> = {
          jan: "01",
          feb: "02",
          mar: "03",
          apr: "04",
          may: "05",
          jun: "06",
          jul: "07",
          aug: "08",
          sep: "09",
          oct: "10",
          nov: "11",
          dec: "12",
        };

        try {
          // Split the input date string into components
          const parts = dateString.split(" ");

          if (parts.length !== 3) {
            throw new Error('Invalid date format. Expected "DD MMM YYYY"');
          }

          const day = parts[0].padStart(2, "0"); // Ensure day has leading zero if needed
          const monthAbbr = parts[1].toLowerCase();
          const year = parts[2];

          // Check if the month abbreviation is valid
          if (!monthMap[monthAbbr]) {
            throw new Error(`Invalid month abbreviation: ${parts[1]}`);
          }

          const month = monthMap[monthAbbr];

          // Return the formatted date
          return `${year}-${month}-${day}`;
        } catch (error) {
          return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
        }
      }

      const getReviewDetails = (item: Element): Review | null => {
        // Get star rating
        const starElement = item.querySelector(".B1UG8d");
        if (!starElement) return null;

        const ariaLabel = starElement.getAttribute("aria-label");
        if (!ariaLabel) return null;

        const ratingMatch = ariaLabel.match(/(\d+) out of 5 stars/);
        if (!ratingMatch) return null;

        const rating = parseInt(ratingMatch[1]);
        if (rating === 5) return null; // Skip 5-star reviews

        // Get date
        const dateElement = item.querySelector(".ydlbEf");
        if (!dateElement) return null;

        const dateStr = dateElement.textContent?.trim();
        if (!dateStr) return null;

        // Get review text
        const textElement = item.querySelector(".fzDEpf");
        const text = textElement ? textElement.textContent?.trim() || "" : "";

        return {
          rating,
          text,
          date: dateStr,
          daysAgoSinceRetrieval: 0,
        };
      };

      // Get all reviews with ratings less than 5
      const reviews = items
        .map(getReviewDetails)
        .filter((review) => review !== null) as Review[];

      return reviews;
    });

    // Filter to get reviews from last 90 days
    const now = dayjs();
    const recentReviews = pageReviews.filter((review) => {
      const targetDate = dayjs(review.date);
      const daysDifference = Math.abs(targetDate.diff(now, "day"));
      review.daysAgoSinceRetrieval = daysDifference;
      return daysDifference <= 90;
    });

    // Check if we found recent low-rated reviews
    if (recentReviews.length > 0) {
      // We found reviews in the last 90 days with less than 5 stars
      lowRatedReviews = recentReviews;
      foundRecentLowRated = true;
    } else if (firstAttempt && pageReviews.length > 0) {
      // If it's the first attempt and no recent low-rated reviews found,
      // store the latest 15 or fewer low-rated reviews
      lowRatedReviews = pageReviews.slice(0, 15);
    }

    firstAttempt = false;

    // If we've gone through all attempts and didn't find recent low-rated reviews,
    // use the ones we stored from the first attempt (if available)
    if (!foundRecentLowRated && lowRatedReviews.length === 0) {
      // The first attempt fallback logic should have already handled this case
      // But just in case, we'll implement a final attempt to get low-rated reviews
      const fallbackReviews = await page.$$eval(".T7rvce", (items) => {
        const getReviewDetails = (
          item: Element,
        ): { rating: number; text: string; date: string } | null => {
          // Get star rating
          const starElement = item.querySelector(".B1UG8d");
          if (!starElement) return null;

          const ariaLabel = starElement.getAttribute("aria-label");
          if (!ariaLabel) return null;

          const ratingMatch = ariaLabel.match(/(\d+) out of 5 stars/);
          if (!ratingMatch) return null;

          const rating = parseInt(ratingMatch[1]);
          if (rating === 5) return null; // Skip 5-star reviews

          // Get date
          const dateElement = item.querySelector(".ydlbEf");
          if (!dateElement) return null;

          const dateStr = dateElement.textContent?.trim() || "";

          // Get review text
          const textElement = item.querySelector(".fzDEpf");
          const text = textElement ? textElement.textContent?.trim() || "" : "";

          return {
            rating,
            text,
            date: dateStr,
          };
        };

        // Get all reviews with ratings less than 5
        return items.map(getReviewDetails).filter((review) => review !== null);
      });

      if (fallbackReviews && fallbackReviews.length > 0) {
        lowRatedReviews = fallbackReviews.slice(0, 15) as Review[];
      }
    }

    await browser.close();
    return lowRatedReviews;
  } catch (error) {
    console.error("Error scraping reviews:", error);
    await browser.close();
    return [];
  }
}

export { getLowRatedReviews };
