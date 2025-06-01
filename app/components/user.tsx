"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Markdown from "react-markdown";

export default function User({
  userId,
  avatar_url,
  name,
  email,
}: {
  userId: string | null;
  avatar_url: string | null;
  name: string | null;
  email: string | null;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef}>
      {userId && avatar_url ? (
        <div>
          <button
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <Image
              className="rounded-full"
              src={avatar_url}
              alt="avatar"
              width={32}
              height={32}
            />
          </button>
          {isOpen && (
            <div
              className="absolute mr-[10px] top-[57px] right-[0px] bg-[#070707] outline-[1px] outline-[#2D2D2D] p-[20px] rounded-[20px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-[5px]">
                <p className="font-medium text-[16px]">{name}</p>
                <p className="font-medium text-[16px] text-[#B9B9B9]">
                  {email}
                </p>
              </div>
              <div className="my-3 -mx-5">
                <div className="h-px bg-[#2D2D2D]"></div>
              </div>
              <button
                className="cursor-pointer w-full text-left font-medium text-[16px] flex flex-row items-center gap-[10px]"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  const supabase = createClient();
                  supabase.auth.signOut();
                  redirect("/login");
                }}
              >
                <Image
                  src="/images/logout.svg"
                  alt="logout"
                  width={18}
                  height={18}
                />
                <p>Log out</p>
              </button>
              <div className="mt-3 -mx-5">
                <div className="h-px bg-[#2D2D2D]"></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>user not logged in</p>
      )}
    </div>
  );
}
