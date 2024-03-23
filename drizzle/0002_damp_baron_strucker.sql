CREATE TABLE IF NOT EXISTS "price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_to_nomenclature" (
	"price_id" uuid NOT NULL,
	"nomenclature_id" uuid NOT NULL,
	CONSTRAINT "price_to_nomenclature_price_id_nomenclature_id_pk" PRIMARY KEY("price_id","nomenclature_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_to_nomenclature" ADD CONSTRAINT "price_to_nomenclature_price_id_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "price"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_to_nomenclature" ADD CONSTRAINT "price_to_nomenclature_nomenclature_id_nomenclature_id_fk" FOREIGN KEY ("nomenclature_id") REFERENCES "nomenclature"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
