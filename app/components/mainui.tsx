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

const fetchProjectInfo = async (
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
    const response = await fetch("/api/get_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, userId }),
    });
    const data = await response.json();
    return {
      info: data.project,
      projectId: data.project.id,
      reviews: data.reviews,
    };
  }
};

const fetchChat = async (projectId: string) => {
  const response = await fetch("/api/get_chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  const data = await response.json();
  return data.chat[0];
};

export default function MainUI({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });
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
  const [analysis, setAnalysis] = useState<string>();
  const [chatId, setChatId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [existingAnalysis, setExistingAnalysis] = useState(false);
  const [infoloading, setInfoLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [renderedLink, setRenderedLink] = useState<string | undefined>(
    undefined,
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
      sessionStorage.getItem("link") || "{}",
    ).linkId;
    if (sessionLink) {
      setRenderedLink(sessionLink);
      setIsLinkLoading(false);
      setChatLoading(false);
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
        complete(
          "Generate a comprehensive report on Pirates of the Carribean",
          {
            body: {
              projectId: projectId,
            },
          },
        );
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
        setExistingAnalysis(true);
        setChatLoading(false);
      }

      sessionStorage.removeItem("link");
    };
    fetchInfo();
  }, [slug, userId]);
  return (
    <div className="w-full h-full flex flex-col items-center px-[10px] justify-center bg-black">
      <div className="rounded-t-[20px] outline-[1px] outline-[#2D2D2D] bg-[#070707] w-full h-screen mt-[10px]">
        <div className="flex flex-row justify-between gap-[5px]">
          <Chat
            id={chatId}
            initialMessages={messages}
            link={renderedLink}
            analysis={analysis}
            completion={completion}
            existingAnalysis={existingAnalysis}
            chatLoading={chatLoading}
          />
          <div>
            <div className="bg-[#101010] h-screen rounded-t-[20px] outline-[1px] outline-[#2D2D2D] p-[20px] max-w-[1000px] min-w-[500px] overflow-y-auto">
              {infoloading ? (
                <p>Loading...</p>
              ) : (
                <>
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
                    className="flex flex-col"
                  >
                    <div className="flex flex-row items-center gap-[15px] bg-[#171717] rounded-t-[20px] outline-[1px] outline-[#2D2D2D] p-[20px]">
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
                    </div>
                    <div className=" bg-[#171717] rounded-b-[20px] outline-[1px] outline-[#2D2D2D] p-[20px]">
                      <p className="font-medium text-[16px] text-[#B5B5B5]">
                        About
                      </p>
                      {info && <ShowMore text={info.description} />}
                    </div>
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
                      opacity: { duration: 0.5 },
                      x: {
                        duration: 0.5,
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                        delay: 0.1,
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
