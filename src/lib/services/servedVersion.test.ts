// src/lib/services/servedVersion.test.ts — тести перевірки версії сервера (VERSIONING-v10 § 2.2, § 4.3)
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/paths', () => ({ base: '' }));

import { fetchServedVersion } from './servedVersion';
import { logService } from './logService.svelte';

describe('fetchServedVersion (VERSIONING-v10 § 2.2)', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.stubGlobal('navigator', { onLine: true });
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it('повертає номер версії при успішній відповіді 200', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ version: '0.2.0' })
		});

		const version = await fetchServedVersion();
		expect(version).toBe('0.2.0');
	});

	it('мережева помилка логується як warn (§ 4.3) і повертає null', async () => {
		const initialErrors = logService.errorCount;
		globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

		const version = await fetchServedVersion();
		expect(version).toBeNull();
		// Помилка мережі не повинна збільшувати errorCount (має бути warn)
		expect(logService.errorCount).toBe(initialErrors);
	});

	it('відповідь сервера 404/500 повертає null без збільшення помилок errorCount', async () => {
		const initialErrors = logService.errorCount;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			json: async () => ({})
		});

		const version = await fetchServedVersion();
		expect(version).toBeNull();
		expect(logService.errorCount).toBe(initialErrors);
	});

	it('скасований запит через AbortSignal тихо повертає null без варнінгів', async () => {
		const controller = new AbortController();
		controller.abort();

		globalThis.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

		const version = await fetchServedVersion(controller.signal);
		expect(version).toBeNull();
	});
});
