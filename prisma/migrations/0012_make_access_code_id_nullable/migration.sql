-- Make access_code_id nullable in safehouse_access_logs_new table
ALTER TABLE "public"."safehouse_access_logs_new" ALTER COLUMN "access_code_id" DROP NOT NULL;

