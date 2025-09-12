-- Create junction table for property-contacts relationship
CREATE TABLE public.safehouse_property_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.safehouse_properties(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES public.safehouse_contacts(id) ON DELETE CASCADE,
    relationship_type text NOT NULL DEFAULT 'emergency_contact', -- emergency_contact, tenant, property_manager, etc.
    can_grant_access boolean DEFAULT false, -- Can this contact grant access to others?
    notification_priority integer DEFAULT 1, -- 1 = highest priority, 2 = secondary, etc.
    created_at timestamptz(6) DEFAULT now(),
    updated_at timestamptz(6) DEFAULT now(),
    
    -- Ensure unique property-contact combinations
    UNIQUE(property_id, contact_id)
);

-- Add tenant-specific fields to contacts table
ALTER TABLE public.safehouse_contacts 
ADD COLUMN is_tenant boolean DEFAULT false,
ADD COLUMN tenant_property_id uuid REFERENCES public.safehouse_properties(id) ON DELETE SET NULL,
ADD COLUMN lease_start_date date,
ADD COLUMN lease_end_date date,
ADD COLUMN emergency_access_level text DEFAULT 'standard'; -- standard, limited, full

-- Enable RLS on the new table
ALTER TABLE public.safehouse_property_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for safehouse_property_contacts
CREATE POLICY "Users can view property contacts for their properties" ON public.safehouse_property_contacts
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.safehouse_properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert property contacts for their properties" ON public.safehouse_property_contacts
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM public.safehouse_properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update property contacts for their properties" ON public.safehouse_property_contacts
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM public.safehouse_properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete property contacts for their properties" ON public.safehouse_property_contacts
  FOR DELETE USING (
    property_id IN (
      SELECT id FROM public.safehouse_properties WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_safehouse_property_contacts_property_id ON public.safehouse_property_contacts(property_id);
CREATE INDEX idx_safehouse_property_contacts_contact_id ON public.safehouse_property_contacts(contact_id);
CREATE INDEX idx_safehouse_property_contacts_relationship_type ON public.safehouse_property_contacts(relationship_type);
CREATE INDEX idx_safehouse_contacts_tenant_property_id ON public.safehouse_contacts(tenant_property_id);
CREATE INDEX idx_safehouse_contacts_is_tenant ON public.safehouse_contacts(is_tenant);
