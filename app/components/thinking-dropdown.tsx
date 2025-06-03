"use client";

import type React from "react";
import { ChevronRight } from "lucide-react";

interface ThinkingDropdownProps {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ThinkingDropdown({
  title = "Thinking...",
  children,
  isOpen,
  onToggle,
}: ThinkingDropdownProps) {
  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[16px] font-medium text-[#B9B9B9]">{title}</span>
        <ChevronRight
          className={`w-4 h-4 text-[#B9B9B9] transition-transform duration-200 ${
            isOpen ? "transform rotate-90" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="">
          <div className="text-[14px] text-[#B9B9B9] leading-relaxed whitespace-pre-wrap">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
