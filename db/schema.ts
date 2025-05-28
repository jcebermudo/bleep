import { integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
