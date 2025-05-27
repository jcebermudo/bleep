"use client";

import { useState, useEffect, useRef } from "react";

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
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState();
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
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
      setConfirmation(confirmationData.confirmation);
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
        setLoading(false);
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
        setLoading(false);
      }
    };
    fetchInfo();
  }, [slug, userId, link]);
  return (
    <div>
      {loading ? (
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
    </div>
  );
}
