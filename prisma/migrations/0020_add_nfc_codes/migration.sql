-- CreateTable: safehouse_nfc_codes
CREATE TABLE IF NOT EXISTS "safehouse_nfc_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safehouse_nfc_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: safehouse_nfc_code_properties (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS "safehouse_nfc_code_properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nfc_code_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safehouse_nfc_code_properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique code_id
CREATE UNIQUE INDEX IF NOT EXISTS "safehouse_nfc_codes_code_id_key" ON "safehouse_nfc_codes"("code_id");

-- CreateIndex: index on nfc_code_id
CREATE INDEX IF NOT EXISTS "safehouse_nfc_code_properties_nfc_code_id_idx" ON "safehouse_nfc_code_properties"("nfc_code_id");

-- CreateIndex: index on property_id
CREATE INDEX IF NOT EXISTS "safehouse_nfc_code_properties_property_id_idx" ON "safehouse_nfc_code_properties"("property_id");

-- CreateIndex: unique constraint on nfc_code_id and property_id combination
CREATE UNIQUE INDEX IF NOT EXISTS "safehouse_nfc_code_properties_nfc_code_id_property_id_key" ON "safehouse_nfc_code_properties"("nfc_code_id", "property_id");

-- AddForeignKey: nfc_code_id references safehouse_nfc_codes
ALTER TABLE "safehouse_nfc_code_properties" 
ADD CONSTRAINT "safehouse_nfc_code_properties_nfc_code_id_fkey" 
FOREIGN KEY ("nfc_code_id") 
REFERENCES "safehouse_nfc_codes"("id") 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- AddForeignKey: property_id references safehouse_properties
ALTER TABLE "safehouse_nfc_code_properties" 
ADD CONSTRAINT "safehouse_nfc_code_properties_property_id_fkey" 
FOREIGN KEY ("property_id") 
REFERENCES "safehouse_properties"("id") 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- Insert 10,000 NFC codes (26-1 to 26-10000)
INSERT INTO "safehouse_nfc_codes" ("code_id", "created_at", "updated_at")
SELECT 
    '26-' || generate_series(1, 10000)::text as code_id,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
ON CONFLICT ("code_id") DO NOTHING;
