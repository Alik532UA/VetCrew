// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../svelte.config.js';

/**
 * Хеш інлайн-скрипта у CSP мусить збігатися з тим, що обчислить БРАУЗЕР (SECURITY-v10 § 6.3.1).
 *
 * Браузер хешує текстовий вузол `<script>` ПІСЛЯ розбору HTML, а розбір нормалізує `\r\n` у `\n`.
 * Тест перевіряє, що всі інлайн-скрипти з `src/app.html` покриті валідними sha256-хешами,
 * розміщені після `%sveltekit.head%`, і вердикт не залежить від CRLF/LF.
 */

const sha256 = (text: string): string =>
	`sha256-${createHash('sha256').update(text).digest('base64')}`;

const browserSees = (text: string): string => text.replace(/\r\n?/g, '\n');

function inlineScripts(): string[] {
	const html = readFileSync('src/app.html', 'utf8').replace(/<!--[\s\S]*?-->/g, (comment) =>
		' '.repeat(comment.length)
	);
	return [...html.matchAll(/<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(
		(m) => m[1] ?? ''
	);
}

const cspHashes: string[] = (
	(config as { kit?: { csp?: { directives?: Record<string, string[]> } } }).kit?.csp?.directives?.[
		'script-src'
	] ?? []
).filter((value) => typeof value === 'string' && value.startsWith('sha256-'));

describe('CSP: хеш інлайн-скрипта збігається з тим, що обчислить браузер', () => {
	it('перевірка жива: інлайн-скрипт знайдено і в CSP є sha256', () => {
		expect(
			inlineScripts().length,
			'у app.html немає інлайн-скриптів — хешувати нічого'
		).toBeGreaterThan(0);
		expect(cspHashes.length, 'у script-src немає жодного sha256').toBeGreaterThan(0);
	});

	it('кожен скрипт стоїть після %sveltekit.head% — мета-політика діє лише на те, що після неї', () => {
		const html = readFileSync('src/app.html', 'utf8').replace(/<!--[\s\S]*?-->/g, (comment) =>
			' '.repeat(comment.length)
		);
		const head = html.indexOf('%sveltekit.head%');
		expect(head, 'у app.html немає %sveltekit.head%').toBeGreaterThanOrEqual(0);
		const above = [...html.matchAll(/<script\b[^>]*>/g)]
			.filter((m) => (m.index ?? 0) < head)
			.map((m) => m[0]);
		expect(above, 'скрипт вище %sveltekit.head% політикою не покритий').toEqual([]);
	});

	it('%sveltekit.head% і %sveltekit.body% стоять по одному разу й поза коментарями', () => {
		const raw = readFileSync('src/app.html', 'utf8');
		const comments = [...raw.matchAll(/<!--[\s\S]*?-->/g)].map((m) => m[0]);
		for (const tag of ['%sveltekit.head%', '%sveltekit.body%']) {
			expect(
				comments.filter((comment) => comment.includes(tag)),
				`${tag} у коментарі app.html`
			).toEqual([]);
			expect(raw.split(tag).length - 1, `${tag} мусить стояти в app.html рівно один раз`).toBe(1);
		}
	});

	it('кожен інлайн-скрипт має в політиці свій браузерний хеш', () => {
		const missing = inlineScripts()
			.map((body) => sha256(browserSees(body)))
			.filter((hash) => !cspHashes.includes(hash));
		expect(
			missing,
			`браузер вимагає ${missing.join(', ')}, а в script-src лежить ${cspHashes.join(', ')}.`
		).toEqual([]);
	});

	it('CRLF-хеш у політику НЕ потрапляє', () => {
		const crlf = inlineScripts()
			.filter((body) => body.includes('\r'))
			.map((body) => sha256(body))
			.filter((hash) => cspHashes.includes(hash));
		expect(crlf, `у script-src лежить хеш над CRLF (${crlf.join(', ')})`).toEqual([]);
	});
});

describe('вердикт не залежить від переносів рядків', () => {
	const withCrlf = "(function () {\r\n\tconst t = 'x';\r\n})();\r\n";
	const withLf = withCrlf.replace(/\r\n/g, '\n');

	it('перевірка жива: сирі байти CRLF і LF дають РІЗНІ хеші', () => {
		expect(sha256(withCrlf)).not.toEqual(sha256(withLf));
	});

	it('після нормалізації той самий скрипт дає той самий хеш', () => {
		expect(sha256(browserSees(withCrlf))).toEqual(sha256(browserSees(withLf)));
	});

	it('одиночний CR теж стає LF — так робить розбір HTML', () => {
		expect(browserSees('a\rb')).toEqual('a\nb');
	});
});
