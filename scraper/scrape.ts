"use server";

import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { setTimeout } from "node:timers/promises";
import dayjs from "dayjs";

interface Review {
  rating: number;
  text: string;
  date: string;
  daysAgoSinceRetrieval: number;
}

async function getLowRatedReviews(link: string) {
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
  const browser = await puppeteer.launch({
    args: isLocal
      ? [
          ...puppeteer.defaultArgs(),
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-web-security",
        ]
      : [...chromium.args, "--no-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar",
      )),
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  // Set a realistic user agent to avoid detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  // Optimize page performance
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    // Block unnecessary resources to speed up loading
    if (
      req.resourceType() === "image" ||
      req.resourceType() === "stylesheet" ||
      req.resourceType() === "font"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(`${link}/reviews`, {
      waitUntil: "domcontentloaded", // Faster than networkidle2
      timeout: 30000,
    });

    // Wait for reviews with a reasonable timeout
    await page.waitForSelector(".T7rvce", { timeout: 10000 });

    let lowRatedReviews: Review[] = [];
    let attempts = 0;
    const maxAttempts = 15; // Reduced from 20
    let foundRecentLowRated = false;
    let firstAttempt = true;

    // Load more reviews with better click detection
    console.log("Loading more reviews...");
    while (attempts < maxAttempts) {
      try {
        // Use more specific selector and ensure element is clickable
        const loadMoreButton = await page.waitForSelector(
          '[jsname="Btxakc"]:not([style*="display: none"])',
          { timeout: 1000, visible: true },
        );

        if (!loadMoreButton) break;

        // Check if button is actually clickable
        const isClickable = await page.evaluate((btn) => {
          const rect = btn.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            window.getComputedStyle(btn).display !== "none" &&
            !btn.hasAttribute("disabled")
          );
        }, loadMoreButton);

        if (!isClickable) break;

        // Use both click methods for reliability
        await Promise.race([
          loadMoreButton.click(),
          page.evaluate((btn) => (btn as HTMLElement).click(), loadMoreButton),
        ]);

        attempts++;
        console.log(`Load more attempt: ${attempts}`);

        // Wait for new content with network activity check
        await Promise.race([
          page.waitForResponse(
            (response) => response.url().includes("reviews"),
            { timeout: 3000 },
          ),
        ]);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.log("No more load buttons or error occurred:", errorMessage);
        break;
      }
    }

    console.log("Starting to expand truncated reviews...");
    let expandAttempts = 0;
    const maxExpandAttempts = 25;

    while (expandAttempts < maxExpandAttempts) {
      try {
        // Get all expand buttons at once and click them in batch
        const expandButtons = await page.$$(
          '[jsname="JrM82d"]:not([style*="display: none"])',
        );

        if (expandButtons.length === 0) {
          console.log("No more expandable reviews found");
          break;
        }

        // Click up to 5 buttons at once for efficiency
        const buttonsToClick = expandButtons.slice(0, 5);

        for (const button of buttonsToClick) {
          try {
            await button.scrollIntoView();
            await Promise.race([
              button.click(),
              page.evaluate((btn) => (btn as HTMLElement).click(), button),
            ]);
            expandAttempts++;

            // Small random delay between clicks
            await setTimeout(Math.random() * 200 + 100);
          } catch (e) {
            // Continue with other buttons if one fails
            continue;
          }
        }

        console.log(
          `Expanded ${buttonsToClick.length} reviews (total: ${expandAttempts})`,
        );
      } catch (error) {
        console.log("No more expandable reviews");
        break;
      }
    }

    console.log(`Expanded ${expandAttempts} truncated reviews`);
    // Extract reviews from the current page
    const pageReviews = await page.$$eval(".T7rvce", (items: Element[]) => {
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

        const textElement = item.querySelector(".fzDEpf");
        // const text = textElement ? textElement.textContent?.trim() || "" : "";

        // Create a clone and process it
        let convertedText = "";
        if (textElement) {
          const clone = textElement.cloneNode(true) as HTMLElement;
          // Remove all links
          const links = clone.querySelectorAll("a");
          links.forEach((link) => link.remove());
          // Now get the text content after links are removed
          convertedText = clone.textContent?.trim() || "";
        }

        return {
          rating,
          text: convertedText,
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
    const recentReviews = pageReviews.filter((review: Review) => {
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
      console.log("im here");
    }

    firstAttempt = false;

    // If we've gone through all attempts and didn't find recent low-rated reviews,
    // use the ones we stored from the first attempt (if available)
    if (!foundRecentLowRated && lowRatedReviews.length === 0) {
      // The first attempt fallback logic should have already handled this case
      // But just in case, we'll implement a final attempt to get low-rated reviews
      const fallbackReviews = await page.$$eval(
        ".T7rvce",
        (items: Element[]) => {
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
            // const text = textElement ? textElement.textContent?.trim() || "" : "";

            // Create a clone and process it
            let convertedText = "";
            if (textElement) {
              const clone = textElement.cloneNode(true) as HTMLElement;
              // Remove all links
              const links = clone.querySelectorAll("a");
              links.forEach((link) => link.remove());
              // Now get the text content after links are removed
              convertedText = clone.textContent?.trim() || "";
            }

            return {
              rating,
              text: convertedText,
              date: dateStr,
            };
          };

          // Get all reviews with ratings less than 5
          return items
            .map(getReviewDetails)
            .filter((review) => review !== null);
        },
      );

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
