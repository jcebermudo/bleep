ALTER TABLE "messages" ADD COLUMN "parts" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "reasoning";