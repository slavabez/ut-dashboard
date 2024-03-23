CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
