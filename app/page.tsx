"use server";
import Link from "./components/link";
import { db } from "@/db";

export default async function Home() {
  const reviews = await db.select().from(users);
  return (
    <Link />
  );
}
