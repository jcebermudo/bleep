import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const project = pgTable("project", {
    id: serial("id").primaryKey(),
    project_uuid: text("project_uuid").notNull(),
    user_uuid: text("user_uuid").notNull(),
    name: text("name"),
    icon: text("icon"),
    description: text("description"),
    actual_date_of_creation: text("actual_date_of_creation"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
})

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  project_uuid: text("project_uuid")
    .notNull()
    .references(() => project.project_uuid, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
