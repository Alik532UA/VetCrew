/**
 * The neighbouring sites, and how each one is told which language to open in.
 * Standardised across the ecosystem (I18N-v10 § 3).
 */

export type SiblingId =
	| 'VetCrewEmergency'
	| 'vetcrewgames'
	| 'vetcrew'
	| 'digitalworkshop'
	| 'cv'
	| 'mindstep'
	| 'slovko'
	| 'as5'
	| 'teatralo4ka';

export interface Sibling {
	/** Scheme and host, no trailing slash. */
	origin: string;
	/** Path prefix the site is served under, no trailing slash. Empty on its own domain. */
	base: string;
	/** Every language the site actually serves a full translation for. */
	locales: readonly string[];
	/**
	 * The language served at the BARE path. It never appears as a segment.
	 */
	defaultLocale: string;
	/**
	 * `path` — the language is a URL segment.
	 * `query` — the site has no language segment (?lang=).
	 */
	transport: 'path' | 'query';
	/** Whether the site's URLs end in a slash. Only meaningful for `transport: 'path'`. */
	trailingSlash: boolean;
}

export const SIBLINGS = {
	VetCrewEmergency: {
		origin: 'https://vet-crew-emergency.org',
		base: '',
		locales: ['uk', 'en'],
		defaultLocale: 'uk',
		transport: 'path',
		trailingSlash: false
	},
	vetcrewgames: {
		origin: 'https://alik532ua.github.io',
		base: '/VetCrewGames',
		locales: ['uk', 'en', 'de', 'nl'],
		defaultLocale: 'uk',
		transport: 'path',
		trailingSlash: true
	},
	vetcrew: {
		origin: 'https://alik532ua.github.io',
		base: '/VetCrew',
		locales: ['uk', 'en'],
		defaultLocale: 'uk',
		transport: 'query',
		trailingSlash: false
	},
	digitalworkshop: {
		origin: 'https://alik532ua.github.io',
		base: '/DigitalWorkshop',
		locales: [
			'en',
			'en-us',
			'uk',
			'ja',
			'es',
			'fr',
			'pt',
			'it',
			'de',
			'nl',
			'be',
			'pl',
			'cs',
			'sk',
			'bg',
			'hr',
			'sl',
			'mk',
			'ro',
			'sv',
			'no',
			'da',
			'is',
			'ca',
			'fi',
			'el',
			'ga',
			'cy',
			'et',
			'lv',
			'lt',
			'crh',
			'ka',
			'sq',
			'ko',
			'tr',
			'he',
			'mt',
			'chk',
			'pon',
			'kos',
			'yap'
		],
		defaultLocale: 'uk',
		transport: 'path',
		trailingSlash: true
	},
	cv: {
		origin: 'https://alik532ua.github.io',
		base: '/CV',
		locales: [
			'en',
			'en-us',
			'uk',
			'ja',
			'es',
			'fr',
			'pt',
			'it',
			'de',
			'nl',
			'be',
			'pl',
			'cs',
			'sk',
			'bg',
			'hr',
			'sl',
			'mk',
			'ro',
			'sv',
			'no',
			'da',
			'is',
			'ca',
			'fi',
			'el',
			'ga',
			'cy',
			'et',
			'lv',
			'lt',
			'crh',
			'ka',
			'sq',
			'ko',
			'tr',
			'he',
			'mt',
			'chk',
			'pon',
			'kos',
			'yap'
		],
		defaultLocale: 'en',
		transport: 'path',
		trailingSlash: true
	},
	teatralo4ka: {
		origin: 'https://teatralo4ka.odesa.ua',
		base: '',
		locales: ['uk', 'en'],
		defaultLocale: 'uk',
		transport: 'path',
		trailingSlash: true
	},
	mindstep: {
		origin: 'https://alik532ua.github.io',
		base: '/MindStep',
		locales: ['uk', 'en', 'crh', 'nl'],
		defaultLocale: 'uk',
		transport: 'query',
		trailingSlash: true
	},
	slovko: {
		origin: 'https://alik532ua.github.io',
		base: '/Slovko',
		locales: ['uk', 'en', 'crh', 'nl', 'de', 'el', 'pl'],
		defaultLocale: 'uk',
		transport: 'query',
		trailingSlash: true
	},
	as5: {
		origin: 'https://as5.odesa.ua',
		base: '',
		locales: ['uk', 'en'],
		defaultLocale: 'uk',
		transport: 'query',
		trailingSlash: false
	}
} as const satisfies Record<SiblingId, Sibling>;

const primary = (tag: string): string => tag.toLowerCase().replace(/_/g, '-').split('-')[0] ?? '';

export function resolveSiblingLocale(id: SiblingId, locale: string): string {
	const { defaultLocale } = SIBLINGS[id];
	const locales: readonly string[] = SIBLINGS[id].locales;

	if (locales.includes(locale)) return locale;

	const base = primary(locale);
	const byPrimary = locales.find((candidate) => primary(candidate) === base);
	if (byPrimary) return byPrimary;

	if (locales.includes('en')) return 'en';
	return defaultLocale;
}

export function siblingUrl(
	id: SiblingId,
	locale: string,
	params: Record<string, string> = {}
): string {
	const site = SIBLINGS[id];
	const resolved = resolveSiblingLocale(id, locale);
	const inPath = site.transport === 'path' && resolved !== site.defaultLocale;

	const path = inPath ? `/${resolved}${site.trailingSlash ? '/' : ''}` : '/';

	const query = new URLSearchParams(params);
	if (!inPath) query.set('lang', resolved);

	const search = query.toString();
	return `${site.origin}${site.base}${path}${search ? `?${search}` : ''}`;
}
