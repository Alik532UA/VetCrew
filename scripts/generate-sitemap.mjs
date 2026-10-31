/**
 * Генерація `build/sitemap.xml` (SEO-v10 § 5). Запускається після `vite build`.
 * Сканує всі згенеровані HTML-файли в `build/` і формує валідний XML sitemap.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BUILD_DIR = 'build';
const DEFAULT_ORIGIN = 'https://alik532ua.github.io/VetCrew';

function findHtmlFiles(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			findHtmlFiles(full, out);
		} else if (entry.endsWith('.html') && entry !== '404.html') {
			out.push(full.replace(/\\/g, '/'));
		}
	}
	return out;
}

try {
	const files = findHtmlFiles(BUILD_DIR);
	const pages = [];

	for (const file of files) {
		const html = readFileSync(file, 'utf8');

		// Пропускаємо сторінки із забороною індексації (SEO-v10 § 5.2)
		const robotsMatch = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
		if (robotsMatch && robotsMatch[1].toLowerCase().includes('noindex')) {
			continue;
		}

		const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
		const relative = file.slice(BUILD_DIR.length + 1);
		const isHome = relative === 'index.html';
		const cleanPath = relative.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
		const loc = canonical || (isHome ? `${DEFAULT_ORIGIN}/` : `${DEFAULT_ORIGIN}/${cleanPath}/`);
		const priority = isHome ? '1.0' : '0.8';

		pages.push({ loc, priority });
	}

	pages.sort((a, b) => a.loc.localeCompare(b.loc));

	const urls = pages
		.map(
			(p) => `\t<url>\n\t\t<loc>${p.loc}</loc>\n\t\t<changefreq>weekly</changefreq>\n\t\t<priority>${p.priority}</priority>\n\t</url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	writeFileSync(join(BUILD_DIR, 'sitemap.xml'), xml);
	console.log(`[generate-sitemap] Згенеровано sitemap.xml для ${pages.length} сторінок.`);
} catch (error) {
	console.warn('[generate-sitemap] Не вдалося згенерувати sitemap.xml:', error.message);
}
