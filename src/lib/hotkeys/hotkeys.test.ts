// src/lib/hotkeys/hotkeys.test.ts вЂ” С‚РµСЃС‚Рё СЃРёСЃС‚РµРјРё РіР°СЂСЏС‡РёС… РєР»Р°РІС–С€ (HOTKEYS-v10)
import { describe, expect, it, vi } from 'vitest';
import { HotkeyService, isControlActivation, isTypingTarget, shortcutLetter } from './hotkeys';

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
	describe('shortcutLetter (В§ 2.3 вЂ” СЂРѕР·РєР»Р°РґРєРѕ-СЃС‚С–Р№РєС–СЃС‚СЊ)', () => {
		it('РІРёР·РЅР°С‡Р°С” Р»Р°С‚РёРЅСЃСЊРєСѓ Р»С–С‚РµСЂСѓ Р±РµР·РїРѕСЃРµСЂРµРґРЅСЊРѕ Р· key', () => {
			expect(shortcutLetter({ key: 't', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'T', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'f', code: 'KeyF' })).toBe('f');
		});

		it('РІРёР·РЅР°С‡Р°С” С„С–Р·РёС‡РЅСѓ Р»С–С‚РµСЂСѓ Р·Р° РєРѕРґРѕРј, СЏРєС‰Рѕ СѓРІС–РјРєРЅРµРЅР° РєРёСЂРёР»РёС†СЏ (РЅР°РїСЂРёРєР»Р°Рґ, "Рµ" -> "t")', () => {
			expect(shortcutLetter({ key: 'Рµ', code: 'KeyT' })).toBe('t');
			expect(shortcutLetter({ key: 'Рґ', code: 'KeyL' })).toBe('l');
			expect(shortcutLetter({ key: 'Р°', code: 'KeyF' })).toBe('f');
		});

		it('РїРѕРІРµСЂС‚Р°С” null РґР»СЏ СЃРїРµС†С–Р°Р»СЊРЅРёС… РєР»Р°РІС–С€ С– С†РёС„СЂ', () => {
			expect(shortcutLetter({ key: 'Escape', code: 'Escape' })).toBeNull();
			expect(shortcutLetter({ key: ' ', code: 'Space' })).toBeNull();
			expect(shortcutLetter({ key: '1', code: 'Digit1' })).toBeNull();
		});
	});

	describe('isTypingTarget (В§ 2.1 вЂ” С–Р·РѕР»СЏС†С–СЏ РїРѕР»С–РІ РІРІРѕРґСѓ)', () => {
		it('С–РіРЅРѕСЂСѓС” РіР°СЂСЏС‡С– РєР»Р°РІС–С€С– Сѓ РїРѕР»СЏС… РІРІРѕРґСѓ', () => {
			const inputEl = {
				closest: (selector: string) => (selector.includes('input') ? {} : null)
			};
			const event = createMockEvent({ key: 't', code: 'KeyT', target: inputEl });
			expect(isTypingTarget(event)).toBe(true);
		});

		it('РґРѕР·РІРѕР»СЏС” РєР»Р°РІС–С€С– РЅР° Р·РІРёС‡Р°Р№РЅРёС… Р±Р»РѕРєР°С…', () => {
			const divEl = {
				closest: () => null
			};
			const event = createMockEvent({ key: 't', code: 'KeyT', target: divEl });
			expect(isTypingTarget(event)).toBe(false);
		});
	});

	describe('isControlActivation (В§ 2.4 вЂ” РЅРµРЅР°РІРјРёСЃРЅРµ РїРµСЂРµС…РѕРїР»РµРЅРЅСЏ Space/Enter)', () => {
		it('СЂРѕР·РїС–Р·РЅР°С” Р°РєС‚РёРІР°С†С–СЋ РєРЅРѕРїРєРё С‡РµСЂРµР· Space Р°Р±Рѕ Enter', () => {
			const btnEl = {
				closest: (selector: string) => (selector.includes('button') ? {} : null)
			};
			const spaceEvent = createMockEvent({ code: 'Space', target: btnEl });
			expect(isControlActivation(spaceEvent)).toBe(true);

			const enterEvent = createMockEvent({ code: 'Enter', target: btnEl });
			expect(isControlActivation(enterEvent)).toBe(true);
		});

		it('РЅРµ Р±Р»РѕРєСѓС” РЅР°РІС–РіР°С†С–Р№РЅС– Р»С–С‚РµСЂРё С‡Рё Space РїРѕР·Р° РєРЅРѕРїРєР°РјРё', () => {
			const divEl = { closest: () => null };
			const spaceEvent = createMockEvent({ code: 'Space', target: divEl });
			expect(isControlActivation(spaceEvent)).toBe(false);

			const keyTEvent = createMockEvent({ code: 'KeyT', target: { closest: () => ({}) } });
			expect(isControlActivation(keyTEvent)).toBe(false);
		});
	});

	describe('HotkeyService (В§ 3.1 вЂ” РґРёСЃРїРµС‚С‡РµСЂРёР·Р°С†С–СЏ С‚Р° С€Р°СЂРё)', () => {
		it('РІРёРєР»РёРєР°С” Р·Р°СЂРµС”СЃС‚СЂРѕРІР°РЅСѓ РґС–СЋ С– Р±Р»РѕРєСѓС” РґРµС„РѕР»С‚РЅСѓ РїРѕРІРµРґС–РЅРєСѓ РїСЂРё СѓСЃРїС–С…Сѓ', () => {
			const themeAction = vi.fn(() => true);
			const service = new HotkeyService({ theme: themeAction });

			const event = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event);

			expect(themeAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(true);
		});

		it('РЅРµ Р±Р»РѕРєСѓС” defaultPrevented, СЏРєС‰Рѕ РґС–СЏ РїРѕРІРµСЂС‚Р°С” false', () => {
			const dummyAction = vi.fn(() => false);
			const service = new HotkeyService({ theme: dummyAction });

			const event = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event);

			expect(dummyAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(false);
		});

		it('С–РіРЅРѕСЂСѓС” РєРѕРјР±С–РЅР°С†С–С— С–Р· СЃРёСЃС‚РµРјРЅРёРјРё РјРѕРґРёС„С–РєР°С‚РѕСЂР°РјРё (Ctrl, Alt, Meta)', () => {
			const themeAction = vi.fn(() => true);
			const service = new HotkeyService({ theme: themeAction });

			const ctrlT = createMockEvent({ key: 't', code: 'KeyT', ctrlKey: true });
			service.handle(ctrlT);
			expect(themeAction).not.toHaveBeenCalled();

			const altT = createMockEvent({ key: 't', code: 'KeyT', altKey: true });
			service.handle(altT);
			expect(themeAction).not.toHaveBeenCalled();
		});

		it('РїС–РґС‚СЂРёРјСѓС” СЃС‚РµРє С€Р°СЂС–РІ (pushLayer) Р· РїСЂС–РѕСЂРёС‚РµС‚РѕРј РІРµСЂС…РЅСЊРѕРіРѕ С€Р°СЂСѓ', () => {
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

			// Р’РёРґР°Р»РµРЅРЅСЏ С€Р°СЂСѓ РІС–РґРЅРѕРІР»СЋС” РїРѕРІРµРґС–РЅРєСѓ Р±Р°Р·РѕРІРёС… РґС–Р№
			removeLayer();
			const event2 = createMockEvent({ key: 't', code: 'KeyT' });
			service.handle(event2);

			expect(globalTheme).toHaveBeenCalledTimes(1);
		});

		it('РІРёРєР»РёРєР°С” РїРµСЂРµС…С–Рґ РЅР° СЃРµРєС†С–С— Р·Р° С†РёС„СЂРѕРІРёРјРё РєР»Р°РІС–С€Р°РјРё 1, 2, 3', () => {
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

		it('РѕР±СЂРѕР±Р»СЏС” Escape С‡РµСЂРµР· РіР»РѕР±Р°Р»СЊРЅСѓ Р°Р±Рѕ С€Р°СЂРѕРІСѓ РґС–СЋ', () => {
			const escapeAction = vi.fn(() => true);
			const service = new HotkeyService({ escape: escapeAction });

			const event = createMockEvent({ code: 'Escape' });
			service.handle(event);

			expect(escapeAction).toHaveBeenCalledTimes(1);
			expect(event.defaultPrevented).toBe(true);
		});
	});
});
