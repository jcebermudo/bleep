"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Project } from "@/db/schema";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

export default function Projects({ userId }: { userId: string | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  if (!userId) {
    setLoggedIn(false);
  }
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchProjects = async () => {
      const response = await fetch(`/api/display_projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setProjects(data.projects);
      setLoggedIn(true);
      setLoading(false);
    };
    fetchProjects();
  }, [userId]);
  return (
    <div className="mt-[30px] max-w-[1050px]">
      {loggedIn ? (
        <div>
          <h2 className="text-[24px] font-medium">My projects</h2>
          {loading ? (
            <div className="flex flex-wrap gap-4 justify-start mt-[20px]">
              <div className="flex flex-col flex-grow items-start gap-[10px] bg-[#171717] max-w-[250px] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D] h-[170px] animate-pulse"></div>
              <div className="flex flex-col flex-grow items-start gap-[10px] bg-[#171717] max-w-[250px] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D] h-[170px] animate-pulse"></div>
              <div className="flex flex-col flex-grow items-start gap-[10px] bg-[#171717] max-w-[250px] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D] h-[170px] animate-pulse"></div>
              <div className="flex flex-col flex-grow items-start gap-[10px] bg-[#171717] max-w-[250px] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D] h-[170px] animate-pulse"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-start mt-[20px]">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${project.project_uuid}`}
                  className="cursor-pointer flex flex-col flex-grow items-start gap-[10px] bg-[#171717] max-w-[250px] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D]"
                >
                  <Image
                    className="rounded-[15px]"
                    src={project.icon || ""}
                    alt={project.name || ""}
                    width={50}
                    height={50}
                  />
                  <div className="flex flex-col gap-[5px]">
                    <h3 className="font-medium text-[16px] text-left">
                      {project.name}
                    </h3>
                    <p className="text-[16px] font-medium text-[#B9B9B9] text-left">
                      {dayjs(project.actual_date_of_creation).fromNow()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
