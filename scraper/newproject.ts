import { db } from "@/db";
import { project } from "@/db/schema";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";

export async function newProject(
  linkId: string,
  userId: string,
  link: string,
  name: string,
  icon: string,
  description: string,
) {
  const date = dayjs().format();
  await db.insert(project).values({
    project_uuid: linkId,
    user_uuid: userId,
    extension_link: link,
    name: name,
    icon: icon,
    description: description,
    actual_date_of_creation: date,
  });
  const project_id = await db.select().from(project).where(eq(project.project_uuid, linkId));
  return project_id[0].id;
}
