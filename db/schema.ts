import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const project = pgTable("project", {
  id: serial("id").primaryKey(),
  project_uuid: text("project_uuid").notNull(),
  user_uuid: text("user_uuid").notNull(),
  extension_link: text("extension_link").notNull(),
  name: text("name"),
  icon: text("icon"),
  description: text("description"),
  actual_date_of_creation: text("actual_date_of_creation"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  date: text("date").notNull(),
  days_ago_since_retrieval: integer("days_ago_since_retrieval").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  project_id: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  analysis: text("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  parts: json("parts").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Project = InferSelectModel<typeof project>;
export type InsertProject = InferInsertModel<typeof project>;

