import { generateId, type Message } from "ai"
import { db } from "@/db";
import { chats, messages as messagesTable } from '@/db/schema';
import { eq } from "drizzle-orm";

export async function createChat(): Promise<string> {
  const id = generateId();
  await db.insert(chats).values({ id, createdAt: new Date() });
  return id;
}

export async function loadChat(id: string): Promise<Message[]> {
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, id))
    .orderBy(messagesTable.createdAt);
  
  return messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    reasoning: msg.reasoning || undefined,
    createdAt: msg.createdAt,
  }));
}

export async function saveChat({
  id,
  messages,
  reasoning,
}: {
  id: string;
  messages: Message[];
  reasoning?: string;
}): Promise<void> {
    await db.insert(messagesTable).values(
      messages.map(msg => ({
        id: msg.id,
        chatId: id,
        role: msg.role,
        content: msg.content,
        reasoning: reasoning,
        // Ensure createdAt is a Date object
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }))
    );
}