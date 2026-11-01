const ESCAPES: Record<string, string> = {
	'<': '\\u003c',
	'>': '\\u003e',
	'&': '\\u0026',
	'\u{2028}': '\\u2028',
	'\u{2029}': '\\u2029'
};

/**
 * Safely stringifies and escapes JSON-LD for injection into <script type="application/ld+json">.
 * Prevents XSS via </script> tags or Unicode line separators.
 * Complies with SECURITY-v10 § 5.3 and SEO-v10 § 3.2.
 */
export function jsonLdScript(data: object): string {
	const json = JSON.stringify(data).replace(/[<>&\u{2028}\u{2029}]/gu, (ch) => ESCAPES[ch] ?? ch);
	return `<script type="application/ld+json">${json}</script>`;
}
