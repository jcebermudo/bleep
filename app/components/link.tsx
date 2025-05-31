"use client";
import { useState, ChangeEvent, FormEvent } from "react";
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

  const validateWebStoreLink = (url: string): boolean => {
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);

      return urlObj.hostname.endsWith("chromewebstore.google.com") || urlObj.hostname.endsWith("chrome.google.com")
    } catch (error) {
      return false
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

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
          className="flex flex-row items-center w-full justify-between gap-4"
        >
          <div className="relative flex-1 overflow-hidden">
            <input
              className="bg-[#171717] outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-medium placeholder:text-[16px] w-full pr-8" // Added pr-8 for padding
              type="text"
              name="link"
              value={inputValue}
              onChange={handleInputChange}
              autoComplete="off"
              placeholder="Paste Chrome webstore link here"
            />
            <div className="absolute -right-4 top-0 bottom-0 w-20 bg-gradient-to-l from-[#171717] to-transparent pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={
              isButtonDisabled
                ? "cursor-not-allowed bg-white w-[37px] h-[37px] flex items-center justify-center rounded-[10px] opacity-50"
                : "cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-[10px]"
            }
          >
            <Image src="/images/arrow.svg" alt="arrow" width={20} height={20} />
          </button>
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
