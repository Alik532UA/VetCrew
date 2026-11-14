import { base } from '$app/paths';

/**
 * Адреса сайту — єдине джерело істини (SEO-v10 § 1.2, CUSTOM-DOMAIN-v10 § 1).
 * Та сама адреса, що й kit.prerender.origin.
 */
export const SITE_ORIGIN = 'https://vet-crew.org';

/**
 * paths.base самого SvelteKit ('' у корені власного домену).
 */
export const SITE_BASE = base;

/**
 * Будує повний канонічний URL для шляху в межах сайту.
 */
export const siteUrl = (path = '/'): string =>
	`${SITE_ORIGIN}${SITE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
