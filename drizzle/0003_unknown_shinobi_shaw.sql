ALTER TABLE "sync_log" DROP CONSTRAINT "sync_log_price_id_price_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_log" ADD CONSTRAINT "sync_log_price_id_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "price"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
