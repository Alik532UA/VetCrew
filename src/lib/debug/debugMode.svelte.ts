// src/lib/debug/debugMode.svelte.ts — лише коли збір логів із пристроїв (DEBUGGING § 3)
import { dev } from '$app/environment';
import { storage } from '$lib/services/storage';

const KEY = 'debug_mode';

export const SHOW_PRESSES_PROD = 55;
export const HIDE_PRESSES = 5;

/** Тристановий прапорець: true — увімкнено, false — вимкнено, null — нічого не сказано. */
function readSaved(): boolean | null {
	const value = storage.get(KEY);
	return value === '1' ? true : value === '0' ? false : null;
}

class DebugMode {
	saved = $state<boolean | null>(readSaved());
	/** Без явного вибору табло видно в dev і не видно в production (§ 2.1). */
	enabled = $derived(this.saved ?? dev);

	get pressesToToggle(): number {
		if (this.enabled) return HIDE_PRESSES;
		return dev ? HIDE_PRESSES : SHOW_PRESSES_PROD;
	}

	toggle(): boolean {
		const next = !this.enabled;
		this.saved = next;
		storage.set(KEY, next ? '1' : '0');
		return next;
	}

	set(value: boolean): void {
		this.saved = value;
		storage.set(KEY, value ? '1' : '0');
	}
}

export const debugMode = new DebugMode();
