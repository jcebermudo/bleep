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
    <div className="">
      <h2>My projects</h2>
      {projects.map((project) => (
        <div key={project.id} className="flex flex-col items-start gap-2">
          <Image
            src={project.icon || ""}
            alt={project.name || ""}
            width={20}
            height={20}
          />
          {project.name}
          <p>{dayjs(project.actual_date_of_creation).fromNow()}</p>
        </div>
      ))}
    </div>
  );
}
