import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { langStore } from './lang.svelte';
import { themeStore } from './theme.svelte';
import { bgStore, DEFAULT_BG_SETTINGS } from './background.svelte';

describe('langStore controller', () => {
	it('має початкову мову uk або en та коректний переклад назви організації', () => {
		expect(['uk', 'en']).toContain(langStore.current);
		expect(langStore.t('brand_name')).toBe('Vet Crew');
	});

	it('перемикає мову та повертає відповідні тексти', () => {
		langStore.set('uk');
		expect(langStore.current).toBe('uk');
		expect(langStore.t('btn_donate')).toBe('Donation');
		expect(langStore.t('btn_facebook')).toBe('Facebook');
		expect(langStore.t('btn_tiktok')).toBe('TikTok');

		langStore.toggle();
		expect(langStore.current).toBe('en');
		expect(langStore.t('btn_donate')).toBe('Donation');
		expect(langStore.t('btn_facebook')).toBe('Facebook');
		expect(langStore.t('btn_tiktok')).toBe('TikTok');

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

describe('bgStore controller', () => {
	it('ініціалізується дефолтними значеннями (фото, blur=0, light=65%, dark=50%)', () => {
		bgStore.reset();
		expect(bgStore.mode).toBe('image');
		expect(bgStore.blur).toBe(0);
		expect(bgStore.lightOpacity).toBe(65);
		expect(bgStore.darkOpacity).toBe(50);
		expect(bgStore.isPanelOpen).toBe(false);
	});

	it('перемикає режим фону між image та solid', () => {
		bgStore.setMode('solid');
		expect(bgStore.mode).toBe('solid');

		bgStore.setMode('image');
		expect(bgStore.mode).toBe('image');
	});

	it('встановлює та обмежує ступінь розмиття (0..20)', () => {
		bgStore.setBlur(8);
		expect(bgStore.blur).toBe(8);

		bgStore.setBlur(-5);
		expect(bgStore.blur).toBe(0);

		bgStore.setBlur(99);
		expect(bgStore.blur).toBe(20);
	});

	it('встановлює та повертає густину пелени відповідно до активної теми', () => {
		themeStore.set('light');
		bgStore.setOpacity(70);
		expect(bgStore.lightOpacity).toBe(70);
		expect(bgStore.currentOpacity).toBe(70);

		themeStore.set('dark');
		expect(bgStore.currentOpacity).toBe(50);
		bgStore.setOpacity(40);
		expect(bgStore.darkOpacity).toBe(40);
		expect(bgStore.currentOpacity).toBe(40);
	});

	it('керує відкриттям та закриттям панелі налаштувань', () => {
		bgStore.closePanel();
		expect(bgStore.isPanelOpen).toBe(false);

		bgStore.openPanel();
		expect(bgStore.isPanelOpen).toBe(true);

		bgStore.togglePanel();
		expect(bgStore.isPanelOpen).toBe(false);
	});

	it('скидає налаштування до стандартних значень', () => {
		bgStore.setMode('solid');
		bgStore.setBlur(15);
		bgStore.setOpacity(20);
		bgStore.setSolidColor('#13371B');
		bgStore.setOverlayColor('#FFB327');
		bgStore.setShowMenuCapsule(false);

		bgStore.reset();
		expect(bgStore.mode).toBe(DEFAULT_BG_SETTINGS.mode);
		expect(bgStore.blur).toBe(DEFAULT_BG_SETTINGS.blur);
		expect(bgStore.lightOpacity).toBe(DEFAULT_BG_SETTINGS.lightOpacity);
		expect(bgStore.darkOpacity).toBe(DEFAULT_BG_SETTINGS.darkOpacity);
		expect(bgStore.lightSolidColor).toBe(DEFAULT_BG_SETTINGS.lightSolidColor);
		expect(bgStore.darkSolidColor).toBe(DEFAULT_BG_SETTINGS.darkSolidColor);
		expect(bgStore.lightOverlayColor).toBe(DEFAULT_BG_SETTINGS.lightOverlayColor);
		expect(bgStore.darkOverlayColor).toBe(DEFAULT_BG_SETTINGS.darkOverlayColor);
		expect(bgStore.showMenuCapsule).toBe(DEFAULT_BG_SETTINGS.showMenuCapsule);
	});

	it('керує наявністю фону/капсули головного меню', () => {
		bgStore.setShowMenuCapsule(true);
		expect(bgStore.showMenuCapsule).toBe(true);

		bgStore.toggleShowMenuCapsule();
		expect(bgStore.showMenuCapsule).toBe(false);

		bgStore.setShowMenuCapsule(true);
		expect(bgStore.showMenuCapsule).toBe(true);
	});

	it('встановлює та повертає кольори фону та пелени для активної теми', () => {
		themeStore.set('dark');
		bgStore.setSolidColor('#13371B');
		expect(bgStore.currentSolidColor).toBe('#13371B');
		bgStore.setOverlayColor('#598F3A');
		expect(bgStore.currentOverlayColor).toBe('#598F3A');

		themeStore.set('light');
		bgStore.setSolidColor('#E5E5E5');
		expect(bgStore.currentSolidColor).toBe('#E5E5E5');
		bgStore.setOverlayColor('#FFB327');
		expect(bgStore.currentOverlayColor).toBe('#FFB327');
	});
});
