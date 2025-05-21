import { NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { link, userId, linkId } = await request.json();
    await db.insert(project).values({
      project_uuid: linkId,
      user_uuid: userId,
      extension_link: link,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
