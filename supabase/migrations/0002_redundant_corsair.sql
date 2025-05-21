ALTER TABLE "chat_messages" RENAME COLUMN "project_uuid" TO "project_id";--> statement-breakpoint
ALTER TABLE "reviews" RENAME COLUMN "project_uuid" TO "project_id";--> statement-breakpoint
ALTER TABLE "project" DROP CONSTRAINT "project_project_uuid_unique";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_project_uuid_project_project_uuid_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_project_uuid_project_project_uuid_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;