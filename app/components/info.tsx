"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "ai";
import Chat from "./chat";

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

export default function Info({
  slug,
  userId,
  link,
}: {
  slug: string;
  userId: string;
  link?: string;
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
  const [infoloading, setInfoLoading] = useState(true);
  const [infoConfirmation, setInfoConfirmation] = useState();
  const [chatId, setChatId] = useState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const hasInfoRun = useRef(false);
  const hasChatRun = useRef(false);
  useEffect(() => {
    if (hasInfoRun.current) return;
    hasInfoRun.current = true;
    const fetchInfo = async () => {
      const confirmation = await fetch("/api/confrimation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: slug,
          userId: userId,
        }),
      });
      const confirmationData = await confirmation.json();
      setInfoConfirmation(confirmationData.confirmation);
      if (!confirmationData.confirmation.length) {
        const info = await fetch("/api/scrape_info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: link,
          }),
        });
        const infoData = await info.json();
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
            linkId: slug,
            userId: userId,
            link: link,
            name: infoData.info.name,
            icon: infoData.info.icon,
            description: infoData.info.description,
          }),
        });
        const projectData = await project.json();
        const reviews = await fetch("/api/scrape_reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: link,
            projectId: projectData.info,
          }),
        });
        const reviewsData = await reviews.json();
        setReviews(reviewsData.fetchReviews);
        setInfoLoading(false);
        return;
      } else {
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
        setReviews(infoData.reviews);
        setInfoLoading(false);
      }
    };
    fetchInfo();
  }, [slug, userId, link]);

  useEffect(() => {
    if (hasChatRun.current) return;
    hasChatRun.current = true;
    if (!infoloading) {
      const fetchChat = async () => {
        const chat = await fetch("/api/get_chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: info.id,
          }),
        });
        const chatData = await chat.json();
        if (!chatData.chat.length) {
          const newchat = await fetch("/api/new_chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: info.id,
            }),
          });
          const newchatData = await newchat.json();
          setChatId(newchatData.chatId);
          const getmessages = await fetch("/api/get_messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatData.chat[0].id,
            }),
          });
          const getmessagesData = await getmessages.json();
          setMessages(getmessagesData.messages);
          setChatLoading(false);
        } else {
          setChatId(chatData.chat[0].id);
          const getmessages = await fetch("/api/get_messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatData.chat[0].id,
            }),
          });
          const getmessagesData = await getmessages.json();
          setMessages(getmessagesData.messages);
          setChatLoading(false);
        }
      };
      fetchChat();
    }
  }, [infoloading]);
  return (
    <div>
      {infoloading ? (
        <p>Loading...</p>
      ) : (
        <>
          {info && <div>{info.name}</div>}
          {info && <p>{info.description}</p>}
          {review && review.length > 0 ? (
            review.map((item, index) => (
              <div key={index}>
                <p>{item.text}</p>
                <p>{item.rating}</p>
                <p>{item.date}</p>
              </div>
            ))
          ) : (
            <p>No reviews available</p>
          )}
        </>
      )}
      {chatLoading ? (
        <p>Loading chat...</p>
      ) : (
        <Chat id={chatId} initialMessages={messages} />
      )}

    </div>
  );
}
