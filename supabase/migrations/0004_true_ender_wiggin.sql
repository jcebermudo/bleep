ALTER TABLE "messages" DROP CONSTRAINT "messages_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "project_id";