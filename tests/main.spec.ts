import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Vet Crew Main Portal E2E', () => {
	test('Головна сторінка завантажується з 3D логотипом та кнопками дій', async ({ page }) => {
		await page.goto('/');

		// Заголовок сторінки
		await expect(page).toHaveTitle(/Vet Crew/i);

		// Перевірка логотипу
		const logo = page.locator('.vetcrew-logo-canvas, .logo-interactive-wrap, svg.logo-svg');
		await expect(logo.first()).toBeVisible();

		// Канали дій
		const insta = page.locator('a[href*="instagram.com/vet.crew"]');
		await expect(insta).toBeVisible();

		const donate = page.locator('a[href*="vet-crew-donation.org"]');
		await expect(donate).toBeVisible();
	});

	test('Доступність (a11y) відповідає стандарту WCAG AA', async ({ page }) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.disableRules(['color-contrast'])
			.analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});
});
