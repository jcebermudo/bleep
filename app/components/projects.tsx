"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Project } from "@/db/schema";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Projects({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
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
      console.log(data.projects);
    };
    fetchProjects();
  }, [userId]);
  return (
    <div className="mt-[30px] mx-[100px]">
      <h2 className="text-[24px] font-medium">My projects</h2>
      <div className="flex flex-wrap gap-4 justify-start mt-[20px]">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col items-start gap-[10px] bg-[#171717] w-[250px] px-[30px] py-[20px] rounded-[20px] outline-[1px] outline-[#2D2D2D]"
          >
            <Image
              className="rounded-[15px]"
              src={project.icon || ""}
              alt={project.name || ""}
              width={50}
              height={50}
            />
            <h3 className="font-medium text-[16px]">{project.name}</h3>
            <p className="text-[16px] font-medium text-[#B9B9B9]">
              {dayjs(project.actual_date_of_creation).fromNow()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
