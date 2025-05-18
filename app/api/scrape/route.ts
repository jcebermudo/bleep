import { NextResponse } from 'next/server';
import { getLowRatedReviews } from '@/scraper/scrape';

export async function POST(request: Request) {
  try {
    const { link } = await request.json();
    const reviews = await getLowRatedReviews(link);
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}