"use client";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Link({ userId }: { userId: string | null }) {
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

  // Separate function to handle textarea auto-resize
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea
    adjustTextareaHeight();

    if (value.trim()) {
      setIsValid(validateWebStoreLink(value));
    } else {
      setIsValid(true);
    }
  };

  // Function to set input value and adjust height
  const setInputValueWithResize = (value: string) => {
    setInputValue(value);
    setIsValid(validateWebStoreLink(value));

    // Use setTimeout to ensure the DOM is updated before adjusting height
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  const gotoProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || !validateWebStoreLink(inputValue)) return;

    const linkId = uuidv4();
    // Ensure the link has https://
    const link = inputValue.startsWith("http")
      ? inputValue
      : `https://${inputValue}`;

    sessionStorage.setItem("link", JSON.stringify({
      link: link,
      linkId: linkId,
    }))

    await router.push(
      `/${linkId}`,
    );
  };

  const isButtonDisabled = !inputValue.trim() || !isValid;

  return (
    <div className="flex flex-col items-center mt-[10px]">
      <div className="bg-[#171717] w-[700px] rounded-[20px] px-[15px] py-[15px] outline-[1.5px] outline-[#2D2D2D]">
        <form
          onSubmit={gotoProject}
          method="get"
          className="flex flex-col w-full justify-between gap-4"
        >
          <textarea
            ref={textareaRef}
            className="bg-[#171717] resize-none font-normal outline-none focus:outline-none text-white placeholder:text-[#B5B5B5] placeholder:font-normal placeholder:text-[16px] w-full pr-8 overflow-hidden"
            name="link"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                gotoProject(e as any);
              }
            }}
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
      <div className="flex flex-row items-center gap-4 font-medium mt-[15px]">
        <button
          className="flex flex-row items-center gap-2 cursor-pointer bg-[#171717] py-[10px] px-[20px] rounded-full outline-[1px] outline-[#2D2D2D]"
          onClick={() =>
            setInputValueWithResize(
              "https://chromewebstore.google.com/detail/grammarly-ai-writing-and/kbfnbcaeplbcioakkpcpgfkobkghlhen"
            )
          }
        >
          <Image
            src="/images/grammarly.png"
            alt="grammarly"
            width={20}
            height={20}
          />
          <span>Grammarly</span>
        </button>
        <button
          className="flex flex-row items-center gap-2 cursor-pointer bg-[#171717] py-[10px] px-[20px] rounded-full outline-[1px] outline-[#2D2D2D]"
          onClick={() =>
            setInputValueWithResize(
              "https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk"
            )
          }
        >
          <Image
            src="/images/lighthouse.png"
            alt="lighthouse"
            width={20}
            height={20}
          />
          <span>Lighthouse</span>
        </button>
        <button
          className="flex flex-row items-center gap-2 cursor-pointer bg-[#171717] py-[10px] px-[20px] rounded-full outline-[1px] outline-[#2D2D2D]"
          onClick={() =>
            setInputValueWithResize(
              "https://chromewebstore.google.com/detail/website-seo-checker/nljcdkjpjnhlilgepggmmagnmebhadnk"
            )
          }
        >
          <Image
            src="/images/webseochecker.png"
            alt="seo"
            width={20}
            height={20}
          />
          <span>Website SEO Checker</span>
        </button>
      </div>
    </div>
  );
}
