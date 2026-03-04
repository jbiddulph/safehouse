-- Add maintenance mode switch setting (default: disabled)
INSERT INTO public.safehouse_settings (setting_key, setting_value, description)
VALUES (
  'maintenance_mode_enabled',
  'false',
  'Whether maintenance mode is enabled and visitors are redirected to /coming-soon'
)
ON CONFLICT (setting_key) DO NOTHING;
