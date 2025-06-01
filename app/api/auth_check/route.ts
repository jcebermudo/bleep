import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    console.log("it works");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return NextResponse.json({ data, error });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 },
    );
  }
}
