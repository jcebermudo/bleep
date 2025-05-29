ALTER TABLE "chats" DROP CONSTRAINT "chats_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "project_id";