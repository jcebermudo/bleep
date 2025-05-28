import { generateId, type Message } from "ai"
import { db } from "@/db";
import { chats, messages as messagesTable } from '@/db/schema';
import { and, eq } from "drizzle-orm";

export async function createChat(): Promise<string> {
  const id = generateId();
  await db.insert(chats).values({ id, project_id: projectId, createdAt: new Date() });
  return id;
}

export async function loadChatDB(id: string): Promise<Message[]> {
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, id))
    .orderBy(messagesTable.createdAt);
  
  return messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    createdAt: msg.createdAt,
  }));
}

export async function saveChatDB({
  id,
  messages,
}: {
  id: string;
  messages: Message[];
}): Promise<void> {
  // Delete existing messages for this chat
  await db.delete(messagesTable).where(eq(messagesTable.chatId, id));
  
  // Insert new messages
  if (messages.length > 0) {
    await db.insert(messagesTable).values(
      messages.map(msg => ({
        id: msg.id,
        chatId: id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date(),
      }))
    );
  }
}