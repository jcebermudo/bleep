"use client";

import { createClient } from "@/utils/supabase/client";

export default function Google() {
  const supabase = createClient();
  return (
    <button
      className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
      onClick={async () =>
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `/auth/callback`,
          },
        })
      }
    >
      Sign in with Google
    </button>
  );
}
