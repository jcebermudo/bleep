"use server"
import { db } from "@/db";
import { project, chats, messages as messagesTable, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadChat } from "./chat-store";
import { type Project, type Review } from "@/db/schema";
import { type Message } from "ai";

// Option 1: Single query with joins (RECOMMENDED)
export default async function getExisting(slug: string): Promise<{
  project: Project | null, 
  reviews: Review[] | [], 
  analysis: string | null, 
  messages: Message[] | [], 
  link: string | null
}> {
  try {
    // Single query to get project with related data
    const result = await db
      .select({
        project: project,
        review: reviews,
        chat: chats
      })
      .from(project)
      .leftJoin(reviews, eq(reviews.project_id, project.id))
      .leftJoin(chats, eq(chats.project_id, project.id))
      .where(eq(project.project_uuid, slug));

    if (result.length === 0) {
      return {
        project: null,
        reviews: [],
        analysis: null,
        messages: [],
        link: null,
      };
    }

    // Process the joined results
    const projectData = result[0].project;
    const reviewsData = result
      .filter(row => row.review !== null)
      .map(row => row.review!)
      .filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      ); // Remove duplicates
    
    const chatData = result.find(row => row.chat !== null)?.chat;
    
    // Load messages separately (this might still be async)
    const messages = chatData ? await loadChat(chatData.id) : [];

    return {
      project: projectData,
      reviews: reviewsData,
      analysis: chatData?.analysis || null,
      messages: messages || [],
      link: projectData.extension_link,
    };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return {
      project: null,
      reviews: [],
      analysis: null,
      messages: [],
      link: null,
    };
  }
}