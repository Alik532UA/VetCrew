import adapter from '@sveltejs/adapter-static';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const rawBase = process.env.BASE_PATH ?? '';

if (rawBase !== '' && !/^\/[^/](?:.*[^/])?$/.test(rawBase)) {
	throw new Error(
		`BASE_PATH must be empty or start-but-not-end with "/", got ${JSON.stringify(rawBase)}. ` +
			'On Git Bash for Windows, MSYS rewrites /foo into a filesystem path — use PowerShell or MSYS_NO_PATHCONV=1.'
	);
}

const base = /** @type {'' | `/${string}`} */ (rawBase);

/**
 * Хеші інлайн-скриптів у src/app.html (SECURITY-v10 § 6.3.1).
 * Нормалізуємо переноси рядків перед обчисленням хешу (Windows CRLF -> LF),
 * оскільки HTML-парсер браузера обчислює хеш нормалізованого тексту.
 */
const inlineScriptHashes = [
	...readFileSync('src/app.html', 'utf-8')
		.replace(/<!--[\s\S]*?-->/g, '')
		.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)
].map(
	(match) =>
		/** @type {`sha256-${string}`} */ (
			`sha256-${createHash('sha256').update((match[1] ?? '').replace(/\r\n/g, '\n')).digest('base64')}`
		)
);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// CODE-QUALITY § 1.1.1: руни для коду проєкту; бібліотеки з node_modules — у власному режимі
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base,
			relative: false
		},
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', ...inlineScriptHashes],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com', 'data:'],
				'img-src': ['self', 'data:', 'blob:', 'https:'],
				'connect-src': ['self'],
				'frame-ancestors': ['none'],
				'base-uri': ['self'],
				'form-action': ['none']
			}
		},
		prerender: {
			entries: ['*'],
			handleUnseenRoutes: 'warn'
		},
		version: {
			pollInterval: 60000
		}
	}
};

export default config;
