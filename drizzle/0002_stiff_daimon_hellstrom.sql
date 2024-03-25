ALTER TABLE "price_to_nomenclature" DROP CONSTRAINT "price_to_nomenclature_price_id_price_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_to_nomenclature" ADD CONSTRAINT "price_to_nomenclature_price_id_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "price"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "price_to_nomenclature" DROP COLUMN IF EXISTS "currency";