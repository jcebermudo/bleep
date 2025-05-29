"use client";
import { useCompletion } from "@ai-sdk/react";
import { useEffect } from "react";

export default function Page() {
  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });

  useEffect(() => {
    complete("make me a ukulele song");
  }, []);

  return (
    <div>
      <p>{completion}</p>
    </div>
  );
}
