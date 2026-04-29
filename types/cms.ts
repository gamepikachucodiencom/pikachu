/**
 * CMS Type Definitions
 * Types for custom pages and site settings
 */

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  html_content: string;
  custom_css: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}
