"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "ai";
import Chat from "./chat";
import { useCompletion } from "@ai-sdk/react";
import { div, p } from "motion/react-client";
import Image from "next/image";
import ShowMore from "./showmore";
import Markdown from "react-markdown";
import { motion } from "motion/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

const styles = `
  @keyframes ellipsis {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
  .thinking-text::after {
    content: '...';
    animation: ellipsis 1.5s infinite;
    display: inline-block;
    width: 1.5em;
    text-align: left;
  }
`;

interface Review {
  id: number;
  project_id: number;
  rating: number;
  text: string;
  date: string;
  days_ago_since_retrieval: number;
  created_at: string;
  updated_at: string;
}

interface Info {
  id: number;
  project_uuid: string;
  user_uuid: string;
  extension_link: string;
  name: string;
  icon: string;
  description: string;
  actual_date_of_creation: string;
  created_at: string;
  updated_at: string;
}

/* const fetchProjectInfo = async (
  slug: string,
  userId: string,
  sessionLink?: string,
  sessionLinkId?: string
) => {
  if (sessionLink && slug === sessionLinkId) {
    // Handle new project flow
    const infoResponse = await fetch("/api/scrape_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: sessionLink }),
    });
    const infoData = await infoResponse.json();

    const projectResponse = await fetch("/api/new_project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkId: sessionLinkId,
        userId,
        link: sessionLink,
        name: infoData.info.name,
        icon: infoData.info.icon,
        description: infoData.info.description,
      }),
    });
    const projectData = await projectResponse.json();

    const newchatResponse = await fetch("/api/new_chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: projectData.info,
      }),
    });
    const newchatData = await newchatResponse.json();

    return {
      info: infoData.info,
      projectId: projectData.info,
      chatId: newchatData.chatId,
    };
  } else {
    // Handle existing project flow
    const existingInfoResponse = await fetch("/api/get_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, userId }),
    });
    const existingInfoData = await existingInfoResponse.json();

    const existingChatResponse = await fetch("/api/get_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: existingInfoData.project.id }),
    });
    const existingChatData = await existingChatResponse.json();

    const existingMessagesResponse = await fetch("/api/get_messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: existingChatData.chat[0].id,
      }),
    });
    const existingMessagesData = await existingMessagesResponse.json();

    return {
      info: existingInfoData.project,
      projectId: existingInfoData.project.id,
      reviews: existingInfoData.reviews,
      chatId: existingChatData.chat[0].id,
      messages: existingMessagesData.chatmessages,
    };
  }
}; */

export default function MainUI({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const [info, setInfo] = useState<Info>({
    id: 0,
    project_uuid: "",
    user_uuid: "",
    extension_link: "",
    name: "",
    icon: "",
    description: "",
    actual_date_of_creation: "",
    created_at: "",
    updated_at: "",
  });
  const [review, setReviews] = useState<Review[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [infoloading, setInfoLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [extensionInfoLoading, setExtensionInfoLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [generation, setGeneration] = useState<string>("");
  const [renderedLink, setRenderedLink] = useState<string | undefined>(
    undefined
  );
  const [isLinkLoading, setIsLinkLoading] = useState(true);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    let projectId: string;
    let gatheredInfo: Info;
    let gatheredReview: Review[];
    let varchatId: string;
    const sessionLink = JSON.parse(sessionStorage.getItem("link") || "{}").link;
    const sessionLinkId = JSON.parse(
      sessionStorage.getItem("link") || "{}"
    ).linkId;
    if (sessionLink) {
      setRenderedLink(sessionLink);
      setIsLinkLoading(false);
      setChatLoading(false);
      setInfoLoading(false);
    }
    const fetchInfo = async () => {
      if (sessionLink && slug === sessionLinkId) {
        const info = await fetch("/api/scrape_info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: sessionLink,
          }),
        });
        const infoData = await info.json();
        gatheredInfo = infoData.info;
        setInfo({
          ...infoData.info,
          name: infoData.info?.name || "",
          icon: infoData.info?.icon || "",
          description: infoData.info?.description || "",
          actual_date_of_creation: infoData.info?.actual_date_of_creation || "",
          created_at: infoData.info?.created_at,
          updated_at: infoData.info?.updated_at,
        });
        setExtensionInfoLoading(false);
        const project = await fetch("/api/new_project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            linkId: sessionLinkId,
            userId: userId,
            link: sessionLink,
            name: infoData.info.name,
            icon: infoData.info.icon,
            description: infoData.info.description,
          }),
        });
        const projectData = await project.json();
        projectId = projectData.info;
        const reviews = await fetch("/api/scrape_reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: sessionLink,
            projectId: projectId,
          }),
        });
        const reviewsData = await reviews.json();
        gatheredReview = reviewsData.fetchReviews;
        setReviews(reviewsData.fetchReviews);
        setInfoLoading(false);
        setReviewsLoading(false);
      }

      if (sessionLink && slug === sessionLinkId) {
        const newchat = await fetch("/api/new_chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
          }),
        });
        const newchatData = await newchat.json();
        varchatId = newchatData.chatId;
        setChatId(varchatId);
        setChatLoading(false);
      }

      if (sessionLink && slug === sessionLinkId) {
        const response = await fetch("/api/analysis", {
          method: "POST",
          body: JSON.stringify({
            prompt:
              `Generate a comprehensive report on ${gatheredInfo.name} and create an idea for a competing product based on the user reviews.` +
              `The report should be in markdown format.` +
              `Here are the user reviews: ${gatheredReview
                .map((review) => `"${review.text}" (${review.rating} stars)`)
                .slice(0, 10)
                .join("\n\n")}` +
              `Here is the information about the product: ${gatheredInfo.description}` +
              `Here is the date of creation of the product: ${gatheredInfo.actual_date_of_creation}`,
            chatId: varchatId,
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            setGeneration(
              (currentGeneration) => `${currentGeneration || ""}${chunk}`
            );
          }
        } finally {
          reader.releaseLock();
        }
      }

      if (!sessionLink) {
        const info = await fetch("/api/get_info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: slug,
            userId: userId,
          }),
        });
        const infoData = await info.json();
        gatheredInfo = infoData.project;
        projectId = infoData.project.id;
        setRenderedLink(infoData.project.extension_link);
        setIsLinkLoading(false);
        setInfo({
          ...infoData.project,
          name: infoData.project?.name || "",
          icon: infoData.project?.icon || "",
          description: infoData.project?.description || "",
          actual_date_of_creation:
            infoData.project?.actual_date_of_creation || "",
          created_at: infoData.project?.created_at,
          updated_at: infoData.project?.updated_at,
        });
        gatheredReview = infoData.reviews;
        setReviews(infoData.reviews);
        setInfoLoading(false);
        setExtensionInfoLoading(false);
        setReviewsLoading(false);
      }

      if (!sessionLink) {
        const existingchat = await fetch("/api/get_chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
          }),
        });
        const existingchatData = await existingchat.json();
        varchatId = existingchatData.chat[0].id;
        setChatId(varchatId);
        const getmessages = await fetch("/api/get_messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: varchatId,
          }),
        });
        const getmessagesData = await getmessages.json();
        setMessages(getmessagesData.chatmessages);
      }

      if (!sessionLink) {
        const getanalysis = await fetch("/api/get_analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
          }),
        });
        const getanalysisData = await getanalysis.json();
        setAnalysis(getanalysisData.analysis);
        setChatLoading(false);
      }

      sessionStorage.removeItem("link");
    };
    fetchInfo();
  }, [slug, userId]);
  return (
    <div className="w-full flex-1 flex flex-col mt-[10px]">
      <div className="rounded-t-[20px] bg-[#070707] outline-[1px] outline-[#2D2D2D] w-full flex-1">
        <div className="flex flex-row justify-end gap-[5px]">
          <Chat
            id={chatId}
            initialMessages={messages}
            link={renderedLink}
            generation={generation || ""}
            analysis={analysis || ""}
            chatLoading={chatLoading}
            extensionInfoLoading={extensionInfoLoading}
            reviewsLoading={reviewsLoading}
          />
          <div className="flex justify-end">
            <div
              className={`bg-[#101010] w-full h-screen rounded-t-[20px] outline-[1px] outline-[#2D2D2D] p-[20px] overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out origin-right ${
                infoloading
                  ? "w-0 opacity-0 scale-x-0"
                  : "max-w-[600px] w-full opacity-100 scale-x-100"
              }`}
            >
              {infoloading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {!extensionInfoLoading && (
                    <motion.div className="flex flex-col">
                      <motion.div
                        initial={{
                          opacity: 0,
                          x: 200, // Start from bottom
                        }}
                        animate={{
                          opacity: 1,
                          x: 0, // Slide up to top
                        }}
                        transition={{
                          opacity: { duration: 0.5 },
                          x: {
                            duration: 0.5,
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                          }, // Duration for the slide up
                        }}
                        className="flex flex-row items-center gap-[15px]  bg-[#171717] outline-[1px] outline-[#2D2D2D] rounded-[20px] p-[20px]"
                      >
                        <Image
                          src={info.icon}
                          alt={info.name}
                          width={40}
                          height={40}
                        />
                        {info && (
                          <div className="font-medium text-[16px]">
                            {info.name}
                          </div>
                        )}
                      </motion.div>
                      <motion.div
                        initial={{
                          opacity: 0,
                          x: 200, // Start from bottom
                        }}
                        animate={{
                          opacity: 1,
                          x: 0, // Slide up to top
                        }}
                        transition={{
                          opacity: { duration: 0.5, delay: 0.1 },
                          x: {
                            duration: 0.5,
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                            delay: 0.1,
                          }, // Duration for the slide up
                        }}
                        className=" bg-[#171717] outline-[1px] outline-[#2D2D2D] rounded-[20px] p-[20px] mt-[20px]"
                      >
                        <p className="font-medium text-[16px] text-[#B5B5B5]">
                          About
                        </p>
                        {info && <ShowMore text={info.description} />}
                      </motion.div>
                    </motion.div>
                  )}
                  {reviewsLoading && !extensionInfoLoading && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 200, // Start from bottom
                      }}
                      animate={{
                        opacity: 1,
                        x: 0, // Slide up to top
                      }}
                      transition={{
                        opacity: { duration: 0.5, delay: 0.2 },
                        x: {
                          duration: 0.5,
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                          delay: 0.1,
                        }, // Duration for the slide up
                      }}
                      className="flex flex-col mt-[20px] animate-pulse"
                    >
                      <div className="bg-[#171717] flex flex-row items-center gap-[10px] rounded-[20px] outline-[1px] outline-[#2D2D2D] p-[20px]">
                        <LoaderCircle className="w-7 h-7 animate-spin opacity-70" />
                        <p className="font-medium text-white text-[16px]">
                          Loading reviews
                          <span className="thinking-text"></span>
                          <style jsx>{styles}</style>
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {!reviewsLoading && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 200, // Start from bottom
                      }}
                      animate={{
                        opacity: 1,
                        x: 0, // Slide up to top
                      }}
                      transition={{
                        opacity: { duration: 0.5, delay: 0.2 },
                        x: {
                          duration: 0.5,
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                          delay: 0.2,
                        }, // Duration for the slide up
                      }}
                      className="flex flex-col mt-[20px]"
                    >
                      <div className="bg-[#171717] rounded-t-[20px] outline-[1px] outline-[#2D2D2D] p-[20px]">
                        <p className="font-medium text-white text-[16px]">
                          Found {review.length} reviews below 5 stars
                        </p>
                      </div>
                      <div className="bg-[#171717] rounded-b-[20px] outline-[1px] outline-[#2D2D2D] p-[20px] space-y-[20px]">
                        {review && review.length > 0 ? (
                          review.map((item, index) => (
                            <div
                              className="p-[20px] outline-[1px] outline-[#2D2D2D] bg-[#202020] rounded-[20px] space-y-[5px]"
                              key={index}
                            >
                              <div>
                                {item.rating == 4 ? (
                                  <div className="flex flex-row gap-[1px]">
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                  </div>
                                ) : item.rating == 3 ? (
                                  <div className="flex flex-row gap-[1px]">
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                  </div>
                                ) : item.rating == 2 ? (
                                  <div className="flex flex-row gap-[1px]">
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                  </div>
                                ) : item.rating == 1 ? (
                                  <div className="flex flex-row gap-[1px]">
                                    <Image
                                      src="/images/star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                  </div>
                                ) : item.rating == 0 ? (
                                  <div className="flex flex-row gap-[1px]">
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                    <Image
                                      src="/images/empty-star.svg"
                                      alt="star"
                                      width={18}
                                      height={18}
                                    />
                                  </div>
                                ) : (
                                  item.rating
                                )}
                              </div>
                              <ShowMore text={item.text} />
                              <p className="text-[#B5B5B5] font-normal text-[16px]">
                                {item.date}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No reviews available</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
