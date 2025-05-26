import { NextResponse } from "next/server";
import { newProject } from "@/scraper/newproject";

export async function POST(request: Request) {
  try {
    const { link, userId, linkId } = await request.json();
    await newProject(linkId, userId, link);
    return NextResponse.json({ success: true });    
  } catch {
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
