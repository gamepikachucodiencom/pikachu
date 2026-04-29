/**
 * Security Constants
 * Sanitization rules, allowed tags/attributes, and security configurations
 */

/**
 * Allowed HTML tags for content sanitization
 */
export const ALLOWED_HTML_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'b',
  'i',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'img',
  'div',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
] as const;

/**
 * Allowed HTML attributes for content sanitization
 */
export const ALLOWED_HTML_ATTR = [
  'href',
  'src',
  'alt',
  'title',
  'class',
  'id',
  'target',
  'rel',
] as const;

/**
 * Allowed URI regex pattern for sanitization
 * Allows: http, https, mailto, tel, callto, sms, cid, xmpp, data URIs
 */
export const ALLOWED_URI_REGEXP =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * DOMPurify sanitization configuration
 * Spreads readonly arrays into mutable string[] so DOMPurify.sanitize() accepts them
 */
export const SANITIZATION_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_HTML_TAGS],
  ALLOWED_ATTR: [...ALLOWED_HTML_ATTR],
  ALLOWED_URI_REGEXP: ALLOWED_URI_REGEXP,
};

/**
 * Selectors for dangerous elements that should be removed
 */
export const DANGEROUS_SELECTORS = [
  'script',
  'style[type*="javascript"]',
] as const;

/**
 * Attribute prefix that indicates event handlers (should be removed)
 */
export const EVENT_HANDLER_PREFIX = 'on' as const;
