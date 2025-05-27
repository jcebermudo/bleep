import { NextResponse } from "next/server";
import { newProject } from "@/scraper/newproject";

export async function POST(request: Request) {
  try {
    const { linkId, userId, link, name, icon, description } = await request.json();
    const info = await newProject(linkId, userId, link, name, icon, description);
    return NextResponse.json({ info });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch info" },
      { status: 500 },
    );
  }
}
