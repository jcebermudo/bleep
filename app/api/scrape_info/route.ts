import { NextResponse } from "next/server";
import { getExtensionInfo } from "@/scraper/extensionInfo";

export async function POST(request: Request) {
  try {
    const { link } = await request.json();
    const info = await getExtensionInfo(link);
    return NextResponse.json({ info });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}
