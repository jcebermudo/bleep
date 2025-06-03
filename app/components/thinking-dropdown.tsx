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
    <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-gray-100/50 transition-colors duration-150 focus:outline-none focus:bg-gray-100/50"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-90" : ""
          }`}
        />
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </button>

      <div
        className={`transition-all duration-300 ease-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
