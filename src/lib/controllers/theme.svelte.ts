import { browser } from '$app/environment';
import { safeLocalStorage } from '../services/storage';

export type Theme = 'dark' | 'light';

class ThemeStore {
	current = $state<Theme>('light');

	constructor() {
		if (browser) {
			const saved = safeLocalStorage.get('theme') as Theme | null;
			// ALWAYS default to 'light' regardless of browser or system prefers-color-scheme
			if (saved === 'dark' || saved === 'light') {
				this.current = saved;
			} else {
				this.current = 'light';
			}
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		this.apply();
	}

	set(theme: Theme) {
		if (theme === 'dark' || theme === 'light') {
			this.current = theme;
			this.apply();
		}
	}

	apply() {
		if (!browser || typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-theme', this.current);
		document.documentElement.classList.toggle('dark', this.current === 'dark');
		document.documentElement.classList.toggle('light', this.current === 'light');
		safeLocalStorage.set('theme', this.current);
		try {
			const metaTheme = document.querySelector('meta[name="theme-color"]');
			if (metaTheme) {
				metaTheme.setAttribute('content', this.current === 'dark' ? '#070e09' : '#f5f8f5');
			}
		} catch {}
	}
}

export const themeStore = new ThemeStore();

