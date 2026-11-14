// src/custom-domain.test.ts — інваріанти переїзду на власний домен (CUSTOM-DOMAIN-v10)
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../svelte.config.js';
import { SITE_BASE, SITE_ORIGIN, siteUrl } from '$lib/config/site';
import { domainProblems, mainAddress, readConst } from '../scripts/check-build/domain.mjs';

describe('CUSTOM-DOMAIN-v10 — переїзд на власний домен vet-crew.org', () => {
	it('SITE_ORIGIN та SITE_BASE у src/lib/config/site.ts налаштовані на новий домен', () => {
		expect(SITE_ORIGIN).toBe('https://vet-crew.org');
		expect(SITE_BASE).toBe('');
		expect(siteUrl('/')).toBe('https://vet-crew.org/');
		expect(siteUrl('/logo.svg')).toBe('https://vet-crew.org/logo.svg');
	});

	it('PROJECT-CONTEXT.md містить Основну адресу нового домену', () => {
		const main = mainAddress('PROJECT-CONTEXT.md');
		expect(main).toBe('https://vet-crew.org/');
	});

	it('static/CNAME містить точний хост домену', () => {
		expect(existsSync('static/CNAME')).toBe(true);
		const cname = readFileSync('static/CNAME', 'utf8').trim();
		expect(cname).toBe('vet-crew.org');
	});

	it('static/robots.txt містить оновлений Sitemap без застарілої бази', () => {
		const robots = readFileSync('static/robots.txt', 'utf8');
		expect(robots).toContain('Sitemap: https://vet-crew.org/sitemap.xml');
		expect(robots).not.toContain('/VetCrew');
	});

	it('static/sitemap.xml веде на новий домен', () => {
		const sitemap = readFileSync('static/sitemap.xml', 'utf8');
		expect(sitemap).toContain('https://vet-crew.org/');
		expect(sitemap).not.toContain('alik532ua.github.io');
	});

	it('static/llms.txt веде на новий домен', () => {
		const llms = readFileSync('static/llms.txt', 'utf8');
		expect(llms).toContain('https://vet-crew.org/');
		expect(llms).not.toContain('alik532ua.github.io');
	});

	it('src/app.html містить og:image на новому домені', () => {
		const html = readFileSync('src/app.html', 'utf8');
		expect(html).toContain('content="https://vet-crew.org/logo.svg"');
		expect(html).not.toContain('alik532ua.github.io');
	});

	it('prerender.origin у svelte.config.js узгоджено з SITE_ORIGIN', () => {
		expect(config.kit?.prerender?.origin).toBe('https://vet-crew.org');
	});

	it('readConst успішно зчитує константу з джерела або кидає помилку', () => {
		const origin = readConst(
			'src/lib/config/site.ts',
			/export const SITE_ORIGIN\s*=\s*['"]([^'"]+)['"]/,
			'SITE_ORIGIN'
		);
		expect(origin).toBe('https://vet-crew.org');
		expect(() => readConst('src/lib/config/site.ts', /NOT_FOUND/, 'NOT_FOUND')).toThrow(
			'NOT_FOUND not found'
		);
	});

	it('domainProblems валідує конфігурацію політики переїзду домену', () => {
		const policy = {
			origin: config.kit?.prerender?.origin ?? SITE_ORIGIN,
			base: config.kit?.paths?.base ?? '',
			mainAddress: mainAddress('PROJECT-CONTEXT.md')
		};
		expect(policy.origin).toBe('https://vet-crew.org');
		expect(policy.base).toBe('');
		expect(policy.mainAddress).toBe('https://vet-crew.org/');

		if (existsSync('build')) {
			const problems = domainProblems('build', policy);
			expect(problems).toEqual([]);
		}
	});
});
