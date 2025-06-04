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
import { type Project, type Review } from "@/db/schema";


export default function MainUI({
  slug,
  userId,
  fetchedProject,
  fetchedReviews,
  fetchedAnalysis,
  fetchedMessages,
  exists,
  link,
}: {
  slug: string;
  userId: string;
  fetchedProject: Project | null;
  fetchedReviews: Review[] | [];
  fetchedAnalysis: string | null;
  fetchedMessages: Message[] | [];
  exists: boolean;
  link: string | null;
}) {
  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });
  const [project, setProject] = useState<Project | null>(fetchedProject);
  const [review, setReviews] = useState<Review[] | []>(fetchedReviews);
  const [chatId, setChatId] = useState<string>();
  const [infoloading, setInfoLoading] = useState(!exists);
  const [renderedLink, setRenderedLink] = useState<string | null>(link);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    let projectId: string;
    let gatheredInfo: Project;
    let gatheredReview: Review[];
    let varchatId: string;
    const sessionLink = JSON.parse(
      sessionStorage.getItem("link") || "{}"
    ).link;
    const fetchInfo = async () => {
      if (!exists && sessionLink) {
           if (sessionLink) {
             setRenderedLink(sessionLink);
           }
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
        setProject({
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
            linkId: slug,
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

      if (!exists && sessionLink) {
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
      }

      if (!exists && sessionLink) {
        complete(
          `Generate a comprehensive Chrome extension analysis from this and generate an extension idea from the gaps that are found. The extension is: ${
            gatheredInfo.name
          }. The description is: ${
            gatheredInfo.description
          }. The reviews are: ${gatheredReview
            .map((item) => item.text)
            .join(" ")}.`,
          {
            body: {
              projectId: projectId,
            },
          },
        );
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
            initialMessages={fetchedMessages}
            link={renderedLink}
            analysis={fetchedAnalysis}
            completion={completion}
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
                        src={project?.icon || "/images/placeholder.png"}
                        alt={project?.name || "none"}
                        width={40}
                        height={40}
                      />
                      {project && (
                        <div className="font-medium text-[16px]">
                          {project.name}
                        </div>
                      )}
                    </div>
                    <div className=" bg-[#171717] rounded-b-[20px] outline-[1px] outline-[#2D2D2D] p-[20px]">
                      <p className="font-medium text-[16px] text-[#B5B5B5]">
                        About
                      </p>
                      {project && <ShowMore text={project.description || ""} />}
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
