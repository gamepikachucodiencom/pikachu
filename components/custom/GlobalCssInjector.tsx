import { getGlobalCss } from '@/lib/cms/server';
import CustomStyleInjector from './CustomStyleInjector';

/**
 * Server component to fetch and inject global CSS
 * This component fetches the global CSS from the database and renders it
 * Gracefully handles errors and missing CSS - fails silently if table doesn't exist
 */
export default async function GlobalCssInjector() {
  // Use a more defensive approach - catch all possible errors
  let globalCss: string | null = null;
  
  try {
    globalCss = await getGlobalCss();
  } catch (error) {
    // Silently fail - this is an optional feature
    // The getGlobalCss function should handle all errors internally,
    // but we add an extra safety layer here
    globalCss = null;
  }

  // Only render if we have CSS
  if (!globalCss) {
    return null;
  }

  return <CustomStyleInjector css={globalCss} id="global-custom-css" />;
}
