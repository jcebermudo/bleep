import puppeteer from 'puppeteer';

interface Review {
    rating: number;
    text: string;
    date: string;
    dateObj?: Date;
}

async function getLowRatedReviews(link: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${link}/reviews`);
    await page.waitForSelector('.T7rvce');
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    let lowRatedReviews: Review[] = [];
    let attempts = 0;
    const maxAttempts = 25; // Maximum 10 attempts to load more reviews
    let foundRecentLowRated = false;
    let firstAttempt = true;

    try {
            // Wait for reviews to load
            await page.waitForSelector('.T7rvce', { timeout: 5000 }).catch(() => null);
            while (attempts < maxAttempts) {
                // 'button' is a CSS selector.
                await page.locator('[jsname="Btxakc"]').click();
                await page.waitForSelector('[jsname="Btxakc"]', { visible: true });
                attempts++;
            }
            // Extract reviews from the current page
            const pageReviews = await page.$$eval('.T7rvce', (items, ninetyDaysAgoStr) => {
                const parseDate = (dateStr: string): Date | null => {
                    const months: {[key: string]: number} = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
                    if (!match) return null;
                    const [_, dayStr, monthStr, yearStr] = match;
                    return new Date(parseInt(yearStr), months[monthStr], parseInt(dayStr));
                };

                const getReviewDetails = (item: Element): Review | null => {
                    // Get star rating
                    const starElement = item.querySelector('.B1UG8d');
                    if (!starElement) return null;

                    const ariaLabel = starElement.getAttribute('aria-label');
                    if (!ariaLabel) return null;

                    const ratingMatch = ariaLabel.match(/(\d+) out of 5 stars/);
                    if (!ratingMatch) return null;
                    
                    const rating = parseInt(ratingMatch[1]);
                    if (rating === 5) return null; // Skip 5-star reviews
                    
                    // Get date
                    const dateElement = item.querySelector('.ydlbEf');
                    if (!dateElement) return null;

                    const dateStr = dateElement.textContent?.trim();
                    if (!dateStr) return null;

                    // Get review text
                    const textElement = item.querySelector('.fzDEpf');
                    const text = textElement ? textElement.textContent?.trim() || "" : "";

                    const dateObj = parseDate(dateStr);
                    if (!dateObj) return null;

                    return {
                        rating,
                        text,
                        date: dateStr,
                        dateObj
                    };
                };

                const ninetyDaysAgo = new Date(ninetyDaysAgoStr);
                
                // Get all reviews with ratings less than 5
                const reviews = items.map(getReviewDetails).filter(review => review !== null) as Review[];
                
                // Filter to get reviews from last 90 days
                const recentReviews = reviews.filter(review => 
                    review.dateObj && review.dateObj > ninetyDaysAgo
                );
                
                return {
                    allReviews: reviews,
                    recentReviews
                };
            }, ninetyDaysAgo.toISOString());

            

            // Check if we found recent low-rated reviews
            if (pageReviews.recentReviews.length > 0) {
                // We found reviews in the last 90 days with less than 5 stars
                lowRatedReviews = pageReviews.recentReviews;
                foundRecentLowRated = true;
            } else if (firstAttempt && pageReviews.allReviews.length > 0) {
                // If it's the first attempt and no recent low-rated reviews found,
                // store the latest 15 or fewer low-rated reviews
                lowRatedReviews = pageReviews.allReviews.slice(0, 15);
            }
            
            firstAttempt = false;

        // If we've gone through all attempts and didn't find recent low-rated reviews,
        // use the ones we stored from the first attempt (if available)
        if (!foundRecentLowRated && lowRatedReviews.length === 0) {
            // The first attempt fallback logic should have already handled this case
            // But just in case, we'll implement a final attempt to get low-rated reviews
            const fallbackReviews = await page.$$eval('.T7rvce', (items) => {
                const getReviewDetails = (item: Element): { rating: number, text: string, date: string } | null => {
                    // Get star rating
                    const starElement = item.querySelector('.B1UG8d');
                    if (!starElement) return null;

                    const ariaLabel = starElement.getAttribute('aria-label');
                    if (!ariaLabel) return null;

                    const ratingMatch = ariaLabel.match(/(\d+) out of 5 stars/);
                    if (!ratingMatch) return null;
                    
                    const rating = parseInt(ratingMatch[1]);
                    if (rating === 5) return null; // Skip 5-star reviews
                    
                    // Get date
                    const dateElement = item.querySelector('.ydlbEf');
                    if (!dateElement) return null;

                    const dateStr = dateElement.textContent?.trim() || "";
                    
                    // Get review text
                    const textElement = item.querySelector('.fzDEpf');
                    const text = textElement ? textElement.textContent?.trim() || "" : "";

                    return {
                        rating,
                        text,
                        date: dateStr
                    };
                };
                
                // Get all reviews with ratings less than 5
                return items.map(getReviewDetails).filter(review => review !== null);
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