import {
  integer,
  uuid,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";


export const chat = pgTable("chat", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  link_id: text("link_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chat_id: integer("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
