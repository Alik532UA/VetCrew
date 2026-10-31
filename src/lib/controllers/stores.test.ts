import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { langStore } from './lang.svelte';
import { themeStore } from './theme.svelte';

describe('langStore controller', () => {
	it('має початкову мову uk або en та коректний переклад назви організації', () => {
		expect(['uk', 'en']).toContain(langStore.current);
		expect(langStore.t('brand_name')).toBe('Vet Crew');
	});

	it('перемикає мову та повертає відповідні тексти', () => {
		langStore.set('uk');
		expect(langStore.current).toBe('uk');
		expect(langStore.t('btn_donate')).toBe('Донат');

		langStore.toggle();
		expect(langStore.current).toBe('en');
		expect(langStore.t('btn_donate')).toBe('Donate');

		langStore.set('uk');
		expect(langStore.current).toBe('uk');
	});
});

describe('themeStore controller', () => {
	it('ініціалізується валідною темою', () => {
		expect(['light', 'dark']).toContain(themeStore.current);
	});

	it('перемикає тему та встановлює значення', () => {
		themeStore.set('light');
		expect(themeStore.current).toBe('light');

		themeStore.toggle();
		expect(themeStore.current).toBe('dark');

		themeStore.set('light');
		expect(themeStore.current).toBe('light');
	});

	it('оновлює meta[name="theme-color"] при перемиканні теми', () => {
		const meta = {
			content: '',
			setAttribute: (k: string, v: string) => {
				if (k === 'content') meta.content = v;
			}
		};
		const doc = {
			documentElement: { setAttribute: () => {}, classList: { toggle: () => {} } },
			querySelector: (selector: string) => (selector === 'meta[name="theme-color"]' ? meta : null)
		};
		vi.stubGlobal('document', doc);

		themeStore.set('dark');
		expect(meta.content).toBe('#070e09');

		themeStore.set('light');
		expect(meta.content).toBe('#f5f8f5');
	});
});

