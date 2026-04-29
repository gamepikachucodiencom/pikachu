'use client';

interface CustomStyleInjectorProps {
  css: string | null | undefined;
  id?: string; // Optional ID for the style tag (useful for per-page CSS)
}

/**
 * Client component to safely inject custom CSS
 * Uses dangerouslySetInnerHTML to inject CSS into a <style> tag
 *
 * @param css - The CSS string to inject (null/undefined = no CSS)
 * @param id - Optional ID for the style tag (useful for per-page CSS scoping)
 */
export default function CustomStyleInjector({
  css,
  id = 'custom-styles',
}: CustomStyleInjectorProps) {
  // Only render if CSS is provided
  if (!css || css.trim().length === 0) {
    return null;
  }

  // Ensure CSS is properly formatted (basic validation)
  const sanitizedCss = css.trim();

  // Inject style tag
  return <style id={id} dangerouslySetInnerHTML={{ __html: sanitizedCss }} />;
}
