"use server";
import { createChat } from "@/tools/chat-store";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const id = await createChat();
    redirect(`/chat/${id}`);
}