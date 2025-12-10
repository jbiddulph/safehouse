-- Add subscription fields to safehouse_profiles table
ALTER TABLE public.safehouse_profiles
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ(6),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS additional_credits INTEGER DEFAULT 0;

