import { describe, expect, it } from 'vitest';
import { INITIATIVES } from './initiatives';

describe('Vet Crew NGO Initiatives Registry (Scalability & Data Invariants)', () => {
	it('defines active core initiatives across multiple categories', () => {
		expect(INITIATIVES.length).toBeGreaterThanOrEqual(4);
		const categories = new Set(INITIATIVES.map((i) => i.category));
		expect(categories.size).toBeGreaterThanOrEqual(3);
	});

	it('ensures each initiative has a unique ID and URL slug', () => {
		const ids = INITIATIVES.map((i) => i.id);
		const slugs = INITIATIVES.map((i) => i.slug);

		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('guarantees complete bilingual titles, summaries, and impact units', () => {
		for (const item of INITIATIVES) {
			expect(item.titleUk.trim()).not.toBe('');
			expect(item.titleEn.trim()).not.toBe('');
			expect(item.summaryUk.trim()).not.toBe('');
			expect(item.summaryEn.trim()).not.toBe('');
			expect(item.impactUnitUk.trim()).not.toBe('');
			expect(item.impactUnitEn.trim()).not.toBe('');
		}
	});

	it('validates positive impact metrics and valid future/current target years', () => {
		for (const item of INITIATIVES) {
			expect(item.impactCount).toBeGreaterThan(0);
			expect(item.targetYear).toBeGreaterThanOrEqual(2025);
		}
	});
});
