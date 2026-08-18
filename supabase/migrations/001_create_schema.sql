-- 1. EXTENSIONS & IMMUTABLE WRAPPERS
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
    SELECT public.unaccent('public.unaccent', $1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text AS $$
    SELECT array_to_string($1, $2);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. RELATIONAL TABLES
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    os_flavors TEXT[] NOT NULL DEFAULT '{}',
    icon_name TEXT,
    badge_color TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    description_vi TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_vi TEXT,
    icon_name TEXT,
    parent_id UUID REFERENCES command_categories(id) ON DELETE SET NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canonical_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES command_categories(id) ON DELETE CASCADE,
    action_key TEXT NOT NULL UNIQUE, -- dot notation: vlan.create
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_vi TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    canonical_action_id UUID REFERENCES canonical_actions(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    command_syntax TEXT NOT NULL,
    full_syntax TEXT,
    prompt_mode TEXT,
    os_flavor TEXT,
    title_vi TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    notes_vi TEXT,
    verification_command TEXT,
    rollback_command TEXT,
    is_destructive BOOLEAN NOT NULL DEFAULT FALSE,
    requires_commit BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    tags TEXT[] NOT NULL DEFAULT '{}',
    parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    examples JSONB NOT NULL DEFAULT '[]'::jsonb,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_commands_updated_at
    BEFORE UPDATE ON commands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS command_device_types (
    command_id UUID NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    device_type_id UUID NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    PRIMARY KEY (command_id, device_type_id)
);

CREATE TABLE IF NOT EXISTS command_favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    command_id UUID NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, command_id)
);

-- 3. TSVECTOR GENERATED COLUMN & INDEXES (DB-08)
ALTER TABLE commands ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(command_syntax, '')), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(title_vi, ''))), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(description_vi, ''))), 'B') ||
    setweight(to_tsvector('simple', coalesce(prompt_mode, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(verification_command, '')), 'C') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(notes_vi, ''))), 'D') ||
    setweight(to_tsvector('simple', immutable_unaccent(immutable_array_to_string(tags, ' '))), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_commands_search_vector ON commands USING gin (search_vector);
CREATE INDEX IF NOT EXISTS idx_commands_syntax_trgm ON commands USING gin (command_syntax gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_commands_title_trgm ON commands USING gin (immutable_unaccent(title_vi) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_commands_desc_trgm ON commands USING gin (immutable_unaccent(description_vi) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_commands_vendor_id ON commands (vendor_id);
CREATE INDEX IF NOT EXISTS idx_commands_canonical_id ON commands (canonical_action_id);
CREATE INDEX IF NOT EXISTS idx_commands_created_by ON commands (created_by);
CREATE INDEX IF NOT EXISTS idx_commands_tags ON commands USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_command_device_types_device ON command_device_types (device_type_id);
CREATE INDEX IF NOT EXISTS idx_canonical_actions_category ON canonical_actions (category_id);

-- 4. ROW LEVEL SECURITY (DB-09)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on vendors" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on device_types" ON device_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on command_categories" ON command_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on canonical_actions" ON canonical_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on commands" ON commands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on command_device_types" ON command_device_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage command_favorites" ON command_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert on commands" ON commands FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Allow authenticated update on commands" ON commands FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on commands" ON commands FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage command_device_types" ON command_device_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage canonical_actions" ON canonical_actions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage command_categories" ON command_categories FOR ALL TO authenticated USING (true);
