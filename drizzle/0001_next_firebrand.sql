ALTER TABLE "manufacturer" DROP CONSTRAINT "manufacturer_name_unique";--> statement-breakpoint
ALTER TABLE "measurement_unit" DROP CONSTRAINT "measurement_unit_name_unique";--> statement-breakpoint
ALTER TABLE "partner" DROP CONSTRAINT "partner_name_unique";--> statement-breakpoint
ALTER TABLE "measurement_unit" DROP CONSTRAINT "measurement_unit_nomenclature_id_nomenclature_id_fk";
--> statement-breakpoint
ALTER TABLE "nomenclature" DROP CONSTRAINT "nomenclature_parent_id_fkey";
--> statement-breakpoint
ALTER TABLE "measurement_unit" ALTER COLUMN "nomenclature_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "meta" json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "measurement_unit" ADD CONSTRAINT "measurement_unit_nomenclature_id_nomenclature_id_fk" FOREIGN KEY ("nomenclature_id") REFERENCES "nomenclature"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
