"use client";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Review {
  rating: number;
  text: string;
  date: string;
  dateObj?: Date;
}

export default function Link({ userId }: { userId: string }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const hasDuplicateUrls = (input: string): boolean => {
    const cleanInput = input.trim();

    // Simple check: if we have "https://" appearing more than once, it's likely concatenated URLs
    const httpsCount = (cleanInput.match(/https?:\/\//g) || []).length;
    if (httpsCount > 1) {
      return true;
    }

    // Also check if we have multiple chrome web store domains
    const domainPattern = /(chromewebstore\.google\.com|chrome\.google\.com)/gi;
    const domainMatches = cleanInput.match(domainPattern) || [];
    if (domainMatches.length > 1) {
      return true;
    }

    return false;
  };

  const validateWebStoreLink = (url: string): boolean => {
    try {
      // Check for duplicate URLs first
      if (hasDuplicateUrls(url)) {
        return false;
      }

      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);

      return (
        urlObj.hostname.endsWith("chromewebstore.google.com") ||
        urlObj.hostname.endsWith("chrome.google.com")
      );
    } catch (error) {
      return false;
    }
  };

  

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (value.trim()) {
      setIsValid(validateWebStoreLink(value));
    } else {
      setIsValid(true);
    }
  }

  const gotoProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || !validateWebStoreLink(inputValue)) return;

    const linkId = uuidv4();
    // Ensure the link has https://
    const link = inputValue.startsWith("http")
      ? inputValue
      : `https://${inputValue}`;

    await router.push(
      `/${linkId}?process=true&link=${encodeURIComponent(link)}`
    );
  };

  const isButtonDisabled = !inputValue.trim() || !isValid;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#171717] w-[700px] rounded-[10px] px-[15px] py-[15px] outline-[1.5px] outline-[#2D2D2D]">
        <form
          onSubmit={gotoProject}
          method="get"
          className="flex flex-col w-full justify-between gap-4"
        >
          <textarea
            ref={textareaRef}
            className="bg-[#171717] resize-none outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-medium placeholder:text-[16px] w-full pr-8 overflow-hidden"
            name="link"
            value={inputValue}
            onChange={handleInputChange}
            onInput={handleInputChange}
            autoComplete="off"
            placeholder="Paste Chrome webstore link here"
            rows={1}
          />
          <div className="w-full flex items-end justify-end">
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={
                isButtonDisabled
                  ? "cursor-not-allowed bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full opacity-50 rotate-270"
                  : "cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-full rotate-270"
              }
            >
              <Image
                src="/images/arrow.svg"
                alt="arrow"
                width={17}
                height={17}
              />
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button
          onClick={() =>
            setInputValue(
              "https://chromewebstore.google.com/detail/grammarly-ai-writing-and/kbfnbcaeplbcioakkpcpgfkobkghlhen"
            )
          }
        >
          Grammarly
        </button>
        <button
          onClick={() =>
            setInputValue(
              "https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk"
            )
          }
        >
          Lighthouse
        </button>
        <button
          onClick={() =>
            setInputValue(
              "https://chromewebstore.google.com/detail/website-seo-checker/nljcdkjpjnhlilgepggmmagnmebhadnk"
            )
          }
        >
          Website SEO Checker
        </button>
      </div>
    </div>
  );
}
