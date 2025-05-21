ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chat_id_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "link_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" DROP COLUMN "chat_id";