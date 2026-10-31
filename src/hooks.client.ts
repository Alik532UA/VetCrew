import type { HandleClientError } from '@sveltejs/kit';
import { logService } from '$lib/services/logService.svelte';
import { chunkMissing, reloadOnce } from '$lib/utils/staleBuild';

/**
 * Клієнтська обробка помилок навігації, завантаження модулів і рендеру (ERROR-HANDLING-v10 § 2.2).
 * Всі неперехоплені клієнтські помилки фіксуються в logService для діагностичного звіту.
 */
export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	// Ігноруємо технічний шум браузера, який не є багом застосунку
	if (typeof message === 'string' && message.includes('ResizeObserver loop')) return;

	const route = event.route.id ?? 'unknown';
	logService.error('app', 'Unhandled client error', { message, status, route });

	// Запасний шар відновлення: якщо на сервері вже новий деплой і старий чанк віддав 404,
	// свіже перезавантаження завантажує актуальну версію сторінки (VERSIONING-v10 § 6).
	if (chunkMissing(error) && reloadOnce(event.url.href)) {
		logService.warn('app', 'stale build — reloading', { to: event.url.pathname });
		return;
	}
};

