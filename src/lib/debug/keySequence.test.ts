// src/lib/debug/keySequence.test.ts — серія натискань (DEBUGGING-v10 § 3.2, § 5)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createKeySequence, listenForSequences, type KeyStroke } from './keySequence';

const press = (letter: string | null = 'v', extra: Partial<KeyStroke> = {}): KeyStroke => ({
	letter,
	code: letter ? `Key${letter.toUpperCase()}` : 'ShiftLeft',
	...extra
});

describe('серія натискань (DEBUGGING § 3.2)', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('поріг набирається серією і скидає лічильник', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ letter: 'v', threshold: 3, onComplete });
		expect([1, 2, 3].map(() => sequence.handle(press()))).toEqual([false, false, true]);
		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(sequence.count).toBe(0);
	});

	it('чужа клавіша скидає серію', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ letter: 'v', threshold: 3, onComplete });
		sequence.handle(press('v'));
		sequence.handle(press('x'));
		expect(sequence.count).toBe(0);
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('модифікатор з літерою скидає серію, а чистий модифікатор ігнорується', () => {
		const sequence = createKeySequence({ letter: 'v', threshold: 5, onComplete: vi.fn() });
		sequence.handle(press('v'));
		expect(sequence.count).toBe(1);
		// Натискання Shift перед літерою не збиває серію
		sequence.handle(press(null, { code: 'ShiftLeft' }));
		expect(sequence.count).toBe(1);
		// Ctrl+V — це вставка, а не крок серії
		sequence.handle(press('v', { ctrlKey: true }));
		expect(sequence.count).toBe(0);
	});

	it('натискання в полі вводу не зараховується і не збиває серію', () => {
		const input = { closest: (sel: string) => sel.includes('input') ? {} : null };
		const sequence = createKeySequence({ letter: 'v', threshold: 3, onComplete: vi.fn() });
		sequence.handle(press('v'));
		expect(sequence.count).toBe(1);
		sequence.handle(press('v', { target: input as unknown as EventTarget }));
		expect(sequence.count).toBe(1);
	});

	it('таймаут скидає серію', () => {
		vi.useFakeTimers();
		const sequence = createKeySequence({ letter: 'v', threshold: 3, windowMs: 1000, onComplete: vi.fn() });
		sequence.handle(press('v'));
		expect(sequence.count).toBe(1);
		vi.advanceTimersByTime(1100);
		expect(sequence.count).toBe(0);
	});

	it('обробник listenForSequences перехоплює подію і знімається', () => {
		const target = new EventTarget();
		vi.stubGlobal('window', target);
		const onComplete = vi.fn();
		const sequence = createKeySequence({ letter: 'v', threshold: 2, onComplete });
		const cleanup = listenForSequences(sequence);

		const e1 = Object.assign(new Event('keydown', { cancelable: true }), {
			key: 'v',
			code: 'KeyV',
			repeat: false,
			ctrlKey: false,
			altKey: false,
			metaKey: false
		});
		target.dispatchEvent(e1);
		expect(onComplete).not.toHaveBeenCalled();

		const e2 = Object.assign(new Event('keydown', { cancelable: true }), {
			key: 'v',
			code: 'KeyV',
			repeat: false,
			ctrlKey: false,
			altKey: false,
			metaKey: false
		});
		target.dispatchEvent(e2);
		expect(onComplete).toHaveBeenCalledTimes(1);

		cleanup();
	});
});

