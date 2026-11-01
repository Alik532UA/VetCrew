// src/lib/debug/keySequence.ts — серія натискань і обробник службових жестів (DEBUGGING-v10 § 3.2, HOTKEYS-v10 § 1.3)

export interface KeyStroke {
	letter: string | null;
	code: string;
	repeat?: boolean;
	ctrlKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
	target?: EventTarget | null;
}

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const MODIFIER = /^(?:Shift|Control|Alt|Meta)(?:Left|Right)$/;

/** Латинська літера з `key`, інакше — фізична клавіша з `code` (HOTKEYS § 1.3). */
export function shortcutLetter(event: { key: string; code: string }): string | null {
	if (/^[a-z]$/i.test(event.key)) return event.key.toLowerCase();
	return /^Key([A-Z])$/.exec(event.code)?.[1]?.toLowerCase() ?? null;
}

/** Поле вводу — через `closest`: фокус у `contenteditable` стоїть на вкладеному вузлі. */
export function isEditableTarget(target: EventTarget | null | undefined): boolean {
	const element = target as Partial<Element> | null | undefined;
	return typeof element?.closest === 'function' && element.closest(EDITABLE) !== null;
}

export function toKeyStroke(event: KeyboardEvent): KeyStroke {
	return {
		letter: shortcutLetter(event),
		code: event.code,
		repeat: event.repeat,
		ctrlKey: event.ctrlKey,
		altKey: event.altKey,
		metaKey: event.metaKey,
		target: event.composedPath?.()[0] ?? event.target
	};
}

export function createKeySequence(options: {
	/** Мала латинська літера. */
	letter: string;
	/** Функцією — коли поріг залежить від стану (§ 3.3). */
	threshold: number | (() => number);
	/** Найбільша пауза між натисканнями серії. */
	windowMs?: number;
	onComplete: () => void;
}) {
	const windowMs = options.windowMs ?? 2000;
	let count = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function reset(): void {
		count = 0;
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	return {
		/** true — серію завершено цим натисканням. */
		handle(input: KeyStroke | KeyboardEvent): boolean {
			const stroke: KeyStroke =
				typeof input === 'object' && input !== null && 'key' in input
					? toKeyStroke(input as KeyboardEvent)
					: (input as KeyStroke);

			// Затиснута клавіша — одне натискання, а набір у полі — не жест і не скидання.
			if (stroke.repeat || isEditableTarget(stroke.target) || MODIFIER.test(stroke.code))
				return false;
			if (stroke.letter !== options.letter || stroke.ctrlKey || stroke.altKey || stroke.metaKey) {
				reset();
				return false;
			}
			count += 1;
			if (timer !== undefined) clearTimeout(timer);
			const threshold =
				typeof options.threshold === 'function' ? options.threshold() : options.threshold;
			if (count >= threshold) {
				reset();
				options.onComplete();
				return true;
			}
			timer = setTimeout(reset, windowMs);
			return false;
		},
		get count(): number {
			return count;
		},
		reset
	};
}

export type KeySequence = ReturnType<typeof createKeySequence>;

/** Глобальний обробник жестів; повертає функцію зняття. */
export function listenForSequences(...sequences: KeySequence[]): () => void {
	if (typeof window === 'undefined') return () => {};

	const onKeydown = (event: KeyboardEvent) => {
		const stroke: KeyStroke = {
			letter: shortcutLetter(event),
			code: event.code,
			repeat: event.repeat,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			target: event.composedPath?.()[0] ?? event.target
		};
		if (sequences.map((sequence) => sequence.handle(stroke)).some(Boolean)) {
			event.preventDefault();
		}
	};

	window.addEventListener('keydown', onKeydown);
	return () => {
		window.removeEventListener('keydown', onKeydown);
		for (const sequence of sequences) sequence.reset();
	};
}
