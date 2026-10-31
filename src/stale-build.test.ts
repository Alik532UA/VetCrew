// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * НОВИЙ ДЕПЛОЙ НЕ ЛАМАЄ ВІДКРИТУ ВКЛАДКУ (VERSIONING-v10 § 6).
 *
 * Оборона з трьох частин:
 * 1. `version.pollInterval` у svelte.config.js — дозволяє клієнту дізнатися про оновлення;
 * 2. `beforeNavigate` у кореневому layout — переводить перехід на свіже завантаження ДО помилки 404;
 * 3. Запасний шар у `handleError` (hooks.client.ts) — ловить зникнення чанків і перезавантажує свіжу сторінку через sessionStore.
 */

const CONFIG = 'svelte.config.js';
const LAYOUT = 'src/routes/+layout.svelte';
const HOOKS = 'src/hooks.client.ts';
const STALE = 'src/lib/utils/staleBuild.ts';

const read = (path: string) => readFileSync(path, 'utf8');

const code = (path: string) =>
	read(path)
		.replace(/\/\*[\s\S]*?\*\//g, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/(^|[^:])\/\/.*/g, '$1 ');

describe('нова збірка й відкрита вкладка', () => {
	it('версія перепитується — інакше про нову збірку ніхто не дізнається', () => {
		expect(code(CONFIG), 'опитування версії вимкнене').toMatch(/version:\s*\{[^}]*pollInterval/);
	});

	it('перехід при новій версії — повним завантаженням', () => {
		const layout = code(LAYOUT);
		expect(layout, 'перехід не перехоплюється').toContain('beforeNavigate(');
		expect(layout, 'умови «є нова версія» немає — повне завантаження на кожному переході').toMatch(
			/updated\.current/
		);
		expect(layout, 'перехід не віддається браузеру').toMatch(
			/freshLoad\(navigation\.to\.url\.href\)/
		);
		expect(layout, 'маршрутизатор із застарілим переліком частин не скасовано').toMatch(
			/navigation\.cancel\(\)/
		);
		expect(layout, 'вихід зі сторінки теж перехоплюється').toMatch(/willUnload/);
	});

	it('запасний шар ловить те, що прослизнуло між опитуваннями', () => {
		const hooks = code(HOOKS);
		const stale = code(STALE);
		expect(stale, 'помилка «частини немає» не розпізнається').toMatch(
			/dynamically imported module/
		);
		expect(stale, 'розпізнається лише Chromium').toMatch(/Importing a module script failed/);
		expect(hooks, 'помилка переходу не розпізнається').toMatch(/chunkMissing\(error\)/);
		expect(hooks, 'людину вертають не туди, куди вона йшла').toMatch(
			/reloadOnce\(event\.url\.href\)/
		);
		expect(stale, 'перезавантаження не веде на адресу').toMatch(/window\.location\.href = href/);
		expect(stale, 'сторінка береться з кешу браузера, а не свіжою').toMatch(/cache: 'reload'/);
		expect(stale, 'запасний шар вантажить сторінку повз свіжу перевірку').toMatch(
			/void freshLoad\(href\)/
		);
	});

	it('запасний шар не крутить цикл перезавантажень', () => {
		const stale = code(STALE);
		expect(stale, 'перезавантаження без захисту від циклу').toMatch(/sessionStore\.get\(/);
		expect(stale, 'позначка не ставиться — захист не працює').toMatch(/sessionStore\.set\(/);
		expect(stale, 'позначка не привʼязана до адреси').toMatch(/=== href\)/);
	});
});

