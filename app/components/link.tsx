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
    <div className="bg-[#171717] w-[561.97px] rounded-[10px] px-[15px] py-[20px]">
      <form
        onSubmit={gotoProject}
        method="get"
        className="flex flex-row items-center w-full justify-between gap-4"
      >
        <input
          className="bg-[#171717] outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-medium placeholder:text-[16px] flex-1"
          type="text"
          name="link"
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
          placeholder="Paste Chrome webstore link here"
        />
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="cursor-pointer bg-white w-[37px] h-[37px] flex items-center justify-center rounded-[10px]"
        >
          <Image src="/images/arrow.svg" alt="arrow" width={20} height={20} />
        </button>
      </form>
    </div>
  );
}
