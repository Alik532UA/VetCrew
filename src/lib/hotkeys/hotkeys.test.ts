// src/lib/hotkeys/hotkeys.test.ts — тести системи гарячих клавіш (HOTKEYS-v10)
import { describe, expect, it, vi } from 'vitest';
import {
	HotkeyService,
	isControlActivation,
	isTypingTarget,
	shortcutLetter,
	KEYMAP,
	POSITIONAL
} from './hotkeys';

function createMockEvent(
	init: {
		key?: string;
		code?: string;
		ctrlKey?: boolean;
		metaKey?: boolean;
		altKey?: boolean;
		shiftKey?: boolean;
		repeat?: boolean;
		target?: unknown;
	} = {}
): KeyboardEvent {
	let prevented = false;
	const event = {
		key: init.key ?? '',
		code: init.code ?? '',
		ctrlKey: init.ctrlKey ?? false,
		metaKey: init.metaKey ?? false,
		altKey: init.altKey ?? false,
		shiftKey: init.shiftKey ?? false,
		repeat: init.repeat ?? false,
		target: (init.target ?? {}) as EventTarget,
		composedPath: () => [init.target ?? {}] as EventTarget[],
		get defaultPrevented() {
			return prevented;
		},
		preventDefault: () => {
			prevented = true;
		}
	} as unknown as KeyboardEvent;

	return event;
}

describe('hotkeys (HOTKEYS-v10)', () => {
	describe('shortcutLetter (§ 2.3 — розкладко-стійкість)', () => {
		it('визначає латинську літеру безпосередньо з key', () => {
			expect(shortcutLetter({ key: 't', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'T', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'f', code: 'KeyF' })).toBe('f');
		});

		it('визначає фізичну літеру за кодом, якщо увімкнена кирилиця (наприклад, "е" -> "t")', () => {
			expect(shortcutLetter({ key: 'е', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'д', code: 'KeyL' })).toBe('l');
			expect(shortcutLetter({ key: 'а', code: 'KeyF' })).toBe('f');
		});

		it('повертає null для спеціальних клавіш і цифр', () => {
			expect(shortcutLetter({ key: 'Escape', code: 'Escape' })).toBeNull();
			expect(shortcutLetter({ key: ' ', code: 'Space' })).toBeNull();
			expect(shortcutLetter({ key: '1', code: 'Digit1' })).toBeNull();
		});
	});

	describe('isTypingTarget (§ 2.1 — ізоляція полів вводу)', () => {
		it('ігнорує гарячі клавіші у полях вводу', () => {
			const inputEl = {
				closest: (selector: string) => (selector.includes('input') ? {} : null)
			};
			const event = createMockEvent({ key: 't', code: 'KeyT', target: inputEl });
			expect(isTypingTarget(event)).toBe(true);
		});

		it('дозволяє клавіші на звичайних блоках', () => {
			const divEl = {
				closest: () => null
			};
			const event = createMockEvent({ key: 't', code: 'KeyT', target: divEl });
			expect(isTypingTarget(event)).toBe(false);
		});
	});

	describe('isControlActivation (§ 2.4 — ненавмисне перехоплення Space/Enter)', () => {
		it('розпізнає активацію кнопки через Space або Enter', () => {
			const btnEl = {
				closest: (selector: string) => (selector.includes('button') ? {} : null)
			};
			const spaceEvent = createMockEvent({ code: 'Space', target: btnEl });
			expect(isControlActivation(spaceEvent)).toBe(true);

			const enterEvent = createMockEvent({ code: 'Enter', target: btnEl });
			expect(isControlActivation(enterEvent)).toBe(true);
		});

		it('не блокує навігаційні літери чи Space поза кнопками', () => {
			const divEl = { closest: () => null };
			const spaceEvent = createMockEvent({ code: 'Space', target: divEl });
			expect(isControlActivation(spaceEvent)).toBe(false);

			const keyTEvent = createMockEvent({ code: 'KeyT', target: { closest: () => ({}) } });
			expect(isControlActivation(keyTEvent)).toBe(false);
		});
	});

	describe('HotkeyService (§ 3.1 — диспетчеризація та шари)', () => {
		it('викликає зареєстровану дію і блокує дефолтну поведінку при успіху', () => {
			const themeAction = vi.fn(() => true);
			const service = new HotkeyService({ theme: themeAction });

			const event = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event);

			expect(themeAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(true);
		});

		it('не блокує defaultPrevented, якщо дія повертає false', () => {
			const dummyAction = vi.fn(() => false);
			const service = new HotkeyService({ theme: dummyAction });

			const event = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event);

			expect(dummyAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(false);
		});

		it('ігнорує комбінації із системними модифікаторами (Ctrl, Alt, Meta)', () => {
			const themeAction = vi.fn(() => true);
			const service = new HotkeyService({ theme: themeAction });

			const ctrlT = createMockEvent({ key: 't', code: 'KeyT', ctrlKey: true });
			service.handle(ctrlT);
			expect(themeAction).not.toHaveBeenCalled();

			const altT = createMockEvent({ key: 't', code: 'KeyT', altKey: true });
			service.handle(altT);
			expect(themeAction).not.toHaveBeenCalled();
		});

		it('підтримує стек шарів (pushLayer) з пріоритетом верхнього шару', () => {
			const globalTheme = vi.fn(() => true);
			const service = new HotkeyService({ theme: globalTheme });

			const layerAction = vi.fn(() => true);
			const removeLayer = service.pushLayer({
				handle: (e) => {
					if (e.code === 'KeyT') {
						layerAction();
						return true;
					}
					return false;
				}
			});

			const event = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event);

			expect(layerAction).toHaveBeenCalledTimes(1);
			expect(globalTheme).not.toHaveBeenCalled();

			// Видалення шару відновлює поведінку базових дій
			removeLayer();
			const event2 = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event2);

			expect(globalTheme).toHaveBeenCalledTimes(1);
		});

		it('викликає перехід на секції за цифровими клавішами 1, 2, 3', () => {
			const sec1 = vi.fn(() => true);
			const sec2 = vi.fn(() => true);
			const sec3 = vi.fn(() => true);
			const service = new HotkeyService({
				'section-1': sec1,
				'section-2': sec2,
				'section-3': sec3
			});

			service.handle(createMockEvent({ code: 'Digit1' }));
			expect(sec1).toHaveBeenCalledTimes(1);

			service.handle(createMockEvent({ code: 'Digit2' }));
			expect(sec2).toHaveBeenCalledTimes(1);

			service.handle(createMockEvent({ code: 'Digit3' }));
			expect(sec3).toHaveBeenCalledTimes(1);
		});

		it('обробляє Escape через глобальну або шарову дію', () => {
			const escapeAction = vi.fn(() => true);
			const service = new HotkeyService({ escape: escapeAction });

			const event = createMockEvent({ code: 'Escape' });
			service.handle(event);

			expect(escapeAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(true);
		});
	});
});
