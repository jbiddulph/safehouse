-- Create safehouse_properties table
CREATE TABLE public.safehouse_properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    postal_code text,
    country text NOT NULL DEFAULT 'US',
    property_type text NOT NULL DEFAULT 'residential', -- residential, commercial, etc.
    qr_code text UNIQUE, -- Unique QR code for emergency access
    nfc_id text UNIQUE, -- Unique NFC chip ID
    emergency_access_enabled boolean DEFAULT true,
    created_at timestamptz(6) DEFAULT now(),
    updated_at timestamptz(6) DEFAULT now()
);

-- Create safehouse_contacts table
CREATE TABLE public.safehouse_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_name text NOT NULL,
    email text NOT NULL,
    phone text,
    relationship text NOT NULL, -- next_of_kin, friend, colleague, family, etc.
    is_primary boolean DEFAULT false, -- Primary emergency contact
    notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}',
    created_at timestamptz(6) DEFAULT now(),
    updated_at timestamptz(6) DEFAULT now()
);

-- Create safehouse_access_logs table for tracking emergency access
CREATE TABLE public.safehouse_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.safehouse_properties(id) ON DELETE CASCADE,
    access_code text NOT NULL UNIQUE,
    access_granted_to text, -- Name of person who accessed
    access_reason text, -- Emergency reason
    access_method text NOT NULL, -- qr_code, nfc, manual
    granted_by_user_id uuid REFERENCES auth.users(id),
    expires_at timestamptz(6) NOT NULL,
    used_at timestamptz(6),
    created_at timestamptz(6) DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.safehouse_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safehouse_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safehouse_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for safehouse_properties
CREATE POLICY "Users can view their own properties" ON public.safehouse_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" ON public.safehouse_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" ON public.safehouse_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON public.safehouse_properties
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for safehouse_contacts
CREATE POLICY "Users can view their own contacts" ON public.safehouse_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON public.safehouse_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON public.safehouse_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON public.safehouse_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for safehouse_access_logs
CREATE POLICY "Users can view access logs for their properties" ON public.safehouse_access_logs
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.safehouse_properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert access logs" ON public.safehouse_access_logs
  FOR INSERT WITH CHECK (true); -- This will be used by service role

-- Create indexes for better performance
CREATE INDEX idx_safehouse_properties_user_id ON public.safehouse_properties(user_id);
CREATE INDEX idx_safehouse_properties_qr_code ON public.safehouse_properties(qr_code);
CREATE INDEX idx_safehouse_properties_nfc_id ON public.safehouse_properties(nfc_id);
CREATE INDEX idx_safehouse_contacts_user_id ON public.safehouse_contacts(user_id);
CREATE INDEX idx_safehouse_access_logs_property_id ON public.safehouse_access_logs(property_id);
CREATE INDEX idx_safehouse_access_logs_access_code ON public.safehouse_access_logs(access_code);
