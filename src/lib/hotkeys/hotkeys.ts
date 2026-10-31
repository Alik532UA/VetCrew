// src/lib/hotkeys/hotkeys.ts — канонічна карта та захисти гарячих клавіш (HOTKEYS-v10)

export const KEYMAP: Readonly<Record<string, string>> = {
	t: 'theme',
	l: 'language',
	f: 'fullscreen',
	h: 'home'
};

export const POSITIONAL: Readonly<Record<string, string>> = {
	Space: 'next',
	PageDown: 'section-next',
	ArrowDown: 'section-next',
	PageUp: 'section-prev',
	ArrowUp: 'section-prev',
	Digit1: 'section-1',
	Numpad1: 'section-1',
	Digit2: 'section-2',
	Numpad2: 'section-2',
	Digit3: 'section-3',
	Numpad3: 'section-3'
};

export type Actions = Partial<Record<string, () => boolean>>;
export type Layer = { handle: (event: KeyboardEvent) => boolean };

const TYPING = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const CONTROLS =
	'button, a[href], summary, input[type="checkbox"], input[type="radio"], [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"]';

function targetOf(event: KeyboardEvent): Element | null {
	const first = event.composedPath?.()[0] ?? event.target;
	if (typeof Element !== 'undefined' && first instanceof Element) {
		return first;
	}
	if (first && typeof (first as { closest?: unknown }).closest === 'function') {
		return first as unknown as Element;
	}
	return null;
}

export function isTypingTarget(event: KeyboardEvent): boolean {
	return targetOf(event)?.closest(TYPING) != null;
}

export function isControlActivation(event: KeyboardEvent): boolean {
	if (event.code !== 'Space' && event.code !== 'Enter' && event.code !== 'NumpadEnter') return false;
	return targetOf(event)?.closest(CONTROLS) != null;
}

export const NATIVE_ESCAPE = ['dialog:modal', '[popover]:popover-open:not([popover="manual" i])'] as const;

export function nativeLayerOpen(doc?: Document | null): boolean {
	if (!doc || typeof doc.querySelector !== 'function') return false;
	return NATIVE_ESCAPE.some((selector) => {
		try {
			return doc.querySelector(selector) !== null;
		} catch {
			return false;
		}
	});
}

export function shortcutLetter(event: { key: string; code: string }): string | null {
	if (/^[a-z]$/i.test(event.key)) return event.key.toLowerCase();
	return /^Key([A-Z])$/.exec(event.code)?.[1]?.toLowerCase() ?? null;
}

export class HotkeyService {
	#layers: Layer[] = [];

	constructor(private readonly actions: Actions = {}) {}

	pushLayer(layer: Layer): () => void {
		this.#layers.push(layer);
		return () => {
			this.#layers = this.#layers.filter((l) => l !== layer);
		};
	}

	handle = (event: KeyboardEvent): void => {
		if (event.defaultPrevented) return;
		if (this.#dispatch(event)) event.preventDefault();
	};

	#dispatch(event: KeyboardEvent): boolean {
		const top = this.#layers.at(-1);
		if (event.code === 'Escape') {
			const doc =
				typeof Document !== 'undefined' && event.currentTarget instanceof Document
					? event.currentTarget
					: typeof document !== 'undefined'
						? document
						: null;
			if (doc && nativeLayerOpen(doc)) {
				return false;
			}
			return top?.handle(event) ?? (this.actions['escape']?.() ?? false);
		}
		if (isTypingTarget(event)) return false;
		if (event.ctrlKey || event.metaKey || event.altKey) return false;
		if (isControlActivation(event)) return false;
		if (top && top.handle(event)) return true;
		const letter = shortcutLetter(event);
		if (letter && event.repeat) return false;
		const action = letter ? KEYMAP[letter] : POSITIONAL[event.code];
		return action ? (this.actions[action]?.() ?? false) : false;
	}

	init(target: Document | Window = typeof document !== 'undefined' ? document : (null as unknown as Document)): () => void {
		if (!target) return () => {};
		target.addEventListener('keydown', this.handle as EventListener);
		return () => target.removeEventListener('keydown', this.handle as EventListener);
	}
}
