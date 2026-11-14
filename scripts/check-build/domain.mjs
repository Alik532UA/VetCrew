// scripts/check-build/domain.mjs — частина каркаса check:build для переїзду на власний домен (CUSTOM-DOMAIN § 7).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Значення константи з джерела; немає — падіння з поясненням, а не порожній рядок.
 * @param {string} file
 * @param {RegExp} pattern
 * @param {string} name
 * @returns {string}
 */
export function readConst(file, pattern, name) {
	const value = pattern.exec(readFileSync(file, 'utf8'))?.[1];
	if (value === undefined)
		throw new Error(`${name} not found in ${file}: the gate cannot compare addresses`);
	return value;
}

/**
 * «Основна адреса» з таблиці PROJECT-CONTEXT.md (§ 4) — третє джерело поруч з origin і базою.
 * @param {string} [file='PROJECT-CONTEXT.md']
 * @returns {string | undefined}
 */
export function mainAddress(file = 'PROJECT-CONTEXT.md') {
	if (!existsSync(file)) return undefined;
	const cell =
		/^\|\s*Основна адреса\s*\|([^|\n]*)\|/m.exec(readFileSync(file, 'utf8'))?.[1]?.trim() ?? '';
	return /[<>]/.test(cell) ? undefined : /^https?:\/\/\S+/.exec(cell)?.[0];
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});

/**
 * @typedef {Object} DomainPolicy
 * @property {string | undefined} origin
 * @property {string} base
 * @property {string | undefined} mainAddress
 */

/**
 * Адреси збірки відповідають основному origin і базі; CSS не прив'язаний до однієї адреси.
 * @param {string} buildDir
 * @param {DomainPolicy} policy
 * @returns {string[]}
 */
export function domainProblems(buildDir, { origin, base, mainAddress: main }) {
	if (!origin)
		throw new Error('origin is not set (kit.prerender.origin): the gate cannot compare addresses');
	/** @type {string[]} */
	const problems = [];
	const home = `${origin}${base}/`;
	// Переїзд атомарний (§ 1): домен у CNAME, origin, база й «Основна адреса» кажуть те саме.
	const cnameFile = join(buildDir, 'CNAME');
	if (existsSync(cnameFile)) {
		const cname = readFileSync(cnameFile, 'utf8').split('\n')[0]?.trim() ?? '';
		if (cname !== new URL(origin).host)
			problems.push(
				`CNAME: ${cname}, but origin is ${origin} — domain and origin moved in different commits`
			);
		if (base !== '')
			problems.push(`CNAME: ${cname} serves pages from the host root, but paths.base is "${base}"`);
	}
	if (main === undefined)
		problems.push('PROJECT-CONTEXT.md: no «Основна адреса» — nothing to tell a half-done move by');
	else if (main.replace(/\/?$/, '/') !== home)
		problems.push(`PROJECT-CONTEXT.md: main address ${main}, but this build is for ${home}`);
	for (const file of walk(buildDir)) {
		if (file.endsWith('.css')) {
			for (const match of readFileSync(file, 'utf8').matchAll(/url\(\s*([^)]+?)\s*\)/g)) {
				const raw = match[1];
				if (!raw) continue;
				const url = raw.replace(/^['"]|['"]$/g, '');
				if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(url)) continue; // data:, https:, //cdn…, #id
				const path = url.split(/[?#]/)[0] ?? '';
				// Від кореня збирач пише адреси під базою (`paths.relative: false`, SEO § 1.2); інша база — вписана.
				if (path.startsWith('/') && base !== '' && !path.startsWith(`${base}/`)) {
					problems.push(`${file}: url(${url}) is outside the base "${base}"`);
					continue;
				}
				const target = path.startsWith('/')
					? join(buildDir, decodeURIComponent(path.slice(base.length)))
					: join(dirname(file), decodeURIComponent(path));
				if (!existsSync(target))
					problems.push(
						`${file}: url(${url}) leads to no file of this build — the address is tied to another base`
					);
			}
		}
		if (file.endsWith('.html')) {
			const html = readFileSync(file, 'utf8');
			// Порядок атрибутів довільний: і ознака тега, і адреса шукаються наперед у межах тега.
			const HEAD_URL =
				/<(link|meta)\b(?=[^>]*\b(?:rel=["']canonical["']|property=["']og:url["']))(?=[^>]*\b(?:href|content)=["']([^"']+)["'])[^>]*>/gi;
			for (const match of html.matchAll(HEAD_URL)) {
				const tag = match[1] ?? '';
				const href = match[2] ?? '';
				if (!href.startsWith(home))
					problems.push(`${file}: ${tag} points to ${href}, not to ${home}`);
			}
			// Подвоєна база: перевірка має сенс лише тоді, коли база не порожня.
			if (base && html.includes(`${base}${base}/`))
				problems.push(`${file}: doubled base ${base}${base}/`);
		}
	}
	const sitemap = join(buildDir, 'sitemap.xml');
	if (existsSync(sitemap)) {
		for (const match of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
			const loc = match[1];
			if (loc && !loc.startsWith(home)) problems.push(`sitemap.xml: ${loc} is not under ${home}`);
		}
	}
	const robots = join(buildDir, 'robots.txt');
	if (existsSync(robots)) {
		const lines = [...readFileSync(robots, 'utf8').matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map(
			(m) => m[1]
		);
		if (lines.length === 0) problems.push('robots.txt: no Sitemap line');
		for (const line of lines)
			if (line && line !== `${home}sitemap.xml`)
				problems.push(`robots.txt: Sitemap ${line} is not ${home}sitemap.xml`);
	}
	return problems;
}
