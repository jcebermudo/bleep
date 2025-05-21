CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_uuid" text NOT NULL,
	"user_uuid" text NOT NULL,
	"name" text,
	"icon" text,
	"description" text,
	"actual_date_of_creation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"date" text NOT NULL,
	"days_ago_since_retrieval" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;