-- Custom pages table for CMS-style custom links (e.g. /about, /rules)
-- Matches prod schema and types/cms.ts CustomPage interface

CREATE TABLE IF NOT EXISTS custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  custom_css TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_is_published ON custom_pages(is_published) WHERE is_published = true;

-- RLS
ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view published pages
DROP POLICY IF EXISTS "Anyone can view published custom pages" ON custom_pages;
CREATE POLICY "Anyone can view published custom pages"
  ON custom_pages FOR SELECT
  USING (is_published = true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_custom_pages_updated_at ON custom_pages;
CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
