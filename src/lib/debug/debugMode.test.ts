// src/lib/debug/debugMode.test.ts — тести стану debugMode (DEBUGGING-v10 § 2.1)
import { describe, expect, it } from 'vitest';
import { debugMode, HIDE_PRESSES } from './debugMode.svelte';

describe('debugMode (DEBUGGING-v10 § 2.1)', () => {
	it('toggle() перемикає стан і повертає актуальне значення', () => {
		const initial = debugMode.enabled;
		const next = debugMode.toggle();
		expect(next).toBe(!initial);
		expect(debugMode.enabled).toBe(!initial);

		// Перемикання назад відновлює попередній стан
		const back = debugMode.toggle();
		expect(back).toBe(initial);
		expect(debugMode.enabled).toBe(initial);
	});

	it('pressesToToggle повертає HIDE_PRESSES (5), коли режим увімкнено', () => {
		debugMode.set(true);
		expect(debugMode.enabled).toBe(true);
		expect(debugMode.pressesToToggle).toBe(HIDE_PRESSES);
	});
});

