-- Create safehouse_settings table
CREATE TABLE IF NOT EXISTS public.safehouse_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamptz(6) DEFAULT now(),
  updated_at timestamptz(6) DEFAULT now()
);

-- Enable RLS on safehouse_settings
ALTER TABLE public.safehouse_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for safehouse_settings
-- Only admins can view and modify settings
CREATE POLICY "Admins can view settings" ON public.safehouse_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.safehouse_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings" ON public.safehouse_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.safehouse_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings" ON public.safehouse_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.safehouse_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete settings" ON public.safehouse_settings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.safehouse_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index on setting_key for faster lookups
CREATE INDEX idx_safehouse_settings_key ON public.safehouse_settings(setting_key);

-- Insert default distance tolerance setting (50 meters)
INSERT INTO public.safehouse_settings (setting_key, setting_value, description)
VALUES ('location_verification_distance_meters', '50', 'Maximum distance in meters for location verification when requesting emergency access')
ON CONFLICT (setting_key) DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_safehouse_settings_updated_at ON public.safehouse_settings;
CREATE TRIGGER set_safehouse_settings_updated_at
BEFORE UPDATE ON public.safehouse_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

