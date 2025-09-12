-- Create the new secure access codes table
CREATE TABLE public.safehouse_access_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.safehouse_properties(id) ON DELETE CASCADE,
    access_code text UNIQUE NOT NULL,
    code_type text DEFAULT 'emergency',
    access_granted_to text,
    access_reason text,
    granted_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_by_contact_id uuid REFERENCES public.safehouse_contacts(id) ON DELETE SET NULL,
    expires_at timestamptz(6) NOT NULL,
    used_at timestamptz(6),
    is_active boolean DEFAULT true,
    max_uses integer,
    use_count integer DEFAULT 0,
    created_at timestamptz(6) DEFAULT now(),
    updated_at timestamptz(6) DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_safehouse_access_codes_property_id ON public.safehouse_access_codes(property_id);
CREATE INDEX idx_safehouse_access_codes_access_code ON public.safehouse_access_codes(access_code);
CREATE INDEX idx_safehouse_access_codes_is_active ON public.safehouse_access_codes(is_active);
CREATE INDEX idx_safehouse_access_codes_expires_at ON public.safehouse_access_codes(expires_at);
CREATE INDEX idx_safehouse_access_codes_code_type ON public.safehouse_access_codes(code_type);

-- Add RLS policies for access codes
ALTER TABLE public.safehouse_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view access codes for their properties" ON public.safehouse_access_codes
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.safehouse_properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can create access codes for their properties" ON public.safehouse_access_codes
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.safehouse_properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can update access codes for their properties" ON public.safehouse_access_codes
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.safehouse_properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete access codes for their properties" ON public.safehouse_access_codes
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.safehouse_properties WHERE id = property_id AND user_id = auth.uid()));

-- Update the access logs table to reference the new access codes
ALTER TABLE public.safehouse_access_logs 
ADD COLUMN access_code_id uuid REFERENCES public.safehouse_access_codes(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX idx_safehouse_access_logs_access_code_id ON public.safehouse_access_logs(access_code_id);

-- Add additional fields to access logs for better tracking
ALTER TABLE public.safehouse_access_logs 
ADD COLUMN used_by_name text,
ADD COLUMN used_by_contact text,
ADD COLUMN location_data jsonb;

-- Update the access logs index
CREATE INDEX idx_safehouse_access_logs_used_at ON public.safehouse_access_logs(used_at);
