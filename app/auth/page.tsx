// app/auth/page.tsx
"use server";

import { createClient } from "@/utils/supabase/server";

export default async function Auth() {
  const supabase = await createClient();

  async function handleSignIn() {
    "use server";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <form action={handleSignIn}>
        <button
          type="submit"
          className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}