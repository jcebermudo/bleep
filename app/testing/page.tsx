"use client";

import { useState } from "react";
import Analysis from "../components/analysis";

export default function Testing() {
  const [prompt, setPrompt] = useState("how tall is albert einstein?");

  return (
    <div>
      <Analysis prompt={prompt} />
    </div>
  );
}