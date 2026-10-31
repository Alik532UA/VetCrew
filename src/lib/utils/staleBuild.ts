import { sessionStore } from '$lib/services/storage';

/**
 * «ЧАСТИНИ ЗАСТОСУНКУ БІЛЬШЕ НЕМАЄ НА СЕРВЕРІ» — уніфіковане розпізнавання (VERSIONING-v10 § 6).
 *
 * Після кожного деплою на GitHub Pages хеші імен файлів оновлюються.
 * Вкладка, відкрита до деплою, посилається на старі чанки (які дають 404).
 * Функція розпізнає системні повідомлення Chromium, Firefox, WebKit і Vite CSS preload.
 */
export const chunkMissing = (error: unknown): boolean => {
	const text = error instanceof Error ? error.message : String(error);
	return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Unable to preload CSS/i.test(
		text
	);
};

const RELOAD_KEY = 'staleReload';

/**
 * Повне завантаження актуальної сторінки з обходом 10-хвилинного кешу Pages (max-age=600).
 */
export async function freshLoad(href: string): Promise<void> {
	try {
		await fetch(href, { cache: 'reload', credentials: 'same-origin' });
	} catch {
		/* офлайн чи помилка мережі — вантажимо як є */
	}
	window.location.href = href;
}

/**
 * Повне завантаження адреси — рівно ОДИН раз на адресу за сесію вкладки (захист від циклічного перезавантаження).
 */
export function reloadOnce(href: string): boolean {
	if (sessionStore.get(RELOAD_KEY) === href) return false;
	sessionStore.set(RELOAD_KEY, href);
	void freshLoad(href);
	return true;
}

