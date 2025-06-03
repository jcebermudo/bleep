"use client";
import { useState } from "react";

export default function ShowMore({
  text,
  maxLength = 200,
}: {
  text: string;
  maxLength?: number;
}) {
  const [showMore, setShowMore] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText =
    showMore || !shouldTruncate ? text : `${text.substring(0, maxLength)}...`;

  if (!text) return null;

  return (
    <div>
      <p className="text-[16px] font-normal mt-[5px] whitespace-pre-line">
        {displayText}
        {shouldTruncate && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-white hover:text-[#ccc] ml-1 underline font-medium cursor-pointer"
          >
            {showMore ? "Show less" : "Show more"}
          </button>
        )}
      </p>
    </div>
  );
}
