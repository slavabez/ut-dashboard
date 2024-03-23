ALTER TABLE "price_to_nomenclature" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "price_to_nomenclature" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "price_to_nomenclature" ADD COLUMN "measurement_unit_id" uuid;--> statement-breakpoint
ALTER TABLE "price_to_nomenclature" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "price_to_nomenclature" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;