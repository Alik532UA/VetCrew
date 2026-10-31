/**
 * Safe Storage Facade (STORAGE-NAMESPACE-v10 § 2 & § 5)
 * Never throws on SecurityError/QuotaExceededError. Namespaces keys with STORAGE_PREFIX.
 */
import { browser } from '$app/environment';
import { STORAGE_PREFIX } from './storagePrefix';
import { logService } from './logService.svelte';

export { STORAGE_PREFIX };

function createStore(area: 'localStorage' | 'sessionStorage') {
	let available = true;

	function open(): Storage | null {
		if (!browser || !available) return null;
		try {
			return window[area];
		} catch (error) {
			available = false;
			logService.warn('storage', `${area} is blocked or unavailable`, error);
			return null;
		}
	}

	return {
		get(key: string): string | null {
			const s = open();
			if (!s) return null;
			try {
				return s.getItem(STORAGE_PREFIX + key);
			} catch (error) {
				logService.warn('storage', `Read failed for key "${key}"`, error);
				return null;
			}
		},

		set(key: string, value: string): boolean {
			const s = open();
			if (!s) return false;
			try {
				s.setItem(STORAGE_PREFIX + key, value);
				return true;
			} catch (error) {
				logService.warn('storage', `Write failed for key "${key}"`, error);
				return false;
			}
		},

		remove(key: string): boolean {
			const s = open();
			if (!s) return false;
			try {
				s.removeItem(STORAGE_PREFIX + key);
				return true;
			} catch (error) {
				logService.warn('storage', `Remove failed for key "${key}"`, error);
				return false;
			}
		},

		clear(): boolean {
			const s = open();
			if (!s) return false;
			try {
				const keysToRemove: string[] = [];
				for (let i = 0; i < s.length; i++) {
					const k = s.key(i);
					if (k && k.startsWith(STORAGE_PREFIX)) {
						keysToRemove.push(k);
					}
				}
				for (const k of keysToRemove) {
					s.removeItem(k);
				}
				return true;
			} catch (error) {
				logService.warn('storage', `Clear failed for namespace "${STORAGE_PREFIX}"`, error);
				return false;
			}
		}
	};
}

export const safeLocalStorage = createStore('localStorage');
export const safeSessionStorage = createStore('sessionStorage');

export const storage = safeLocalStorage;
export const sessionStore = safeSessionStorage;
