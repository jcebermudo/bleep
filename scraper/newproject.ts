import { db } from "@/db";
import { project } from "@/db/schema";

export async function newProject(linkId: string, userId: string, link: string) {
    await db.insert(project).values({
      project_uuid: linkId,
      user_uuid: userId,
      extension_link: link,
    });

    
}