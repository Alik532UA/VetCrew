import { browser } from '$app/environment';
import { safeLocalStorage } from '../services/storage';

export type Lang = 'uk' | 'en';

const TRANSLATIONS = {
	uk: {
		brand_name: 'Vet Crew',
		contacts_heading: 'КОНТАКТИ',
		btn_instagram: 'Instagram',
		btn_instagram_display: 'vet.crew',
		btn_donate: 'Donation',
		btn_donate_display: 'Donation',
		btn_info: 'Інфо',
		btn_info_display: 'У розробці',
		dev_warning: 'Цей сайт знаходиться в процесі розробки',
		dev_warning_close: 'Зрозуміло',
		dev_btn: 'У розробці',
		dev_status_text: 'Цей сайт знаходиться в процесі розробки',
		theme_btn: 'Тема',
		lang_btn: 'Мова',
		lang_name: 'UA',
		fullscreen: 'Екран',
		fullscreen_exit: 'Згорнути',
		scroll_hero: 'Головна',
		scroll_contacts: 'Контакти',
		skip_to_content: 'До основного вмісту'
	},
	en: {
		brand_name: 'Vet Crew',
		contacts_heading: 'CONTACTS',
		btn_instagram: 'Instagram',
		btn_instagram_display: 'vet.crew',
		btn_donate: 'Donation',
		btn_donate_display: 'Donation',
		btn_info: 'Info',
		btn_info_display: 'Under dev',
		dev_warning: 'This website is currently under development',
		dev_warning_close: 'Got it',
		dev_btn: 'In dev',
		dev_status_text: 'This website is currently under development',
		theme_btn: 'Theme',
		lang_btn: 'Language',
		lang_name: 'EN',
		fullscreen: 'Fullscreen',
		fullscreen_exit: 'Exit',
		scroll_hero: 'Hero',
		scroll_contacts: 'Contacts',
		skip_to_content: 'Skip to content'
	}
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.uk;

class LangStore {
	current = $state<Lang>('uk');

	constructor() {
		if (browser) {
			const queryLang =
				typeof window !== 'undefined' && window.location
					? (new URLSearchParams(window.location.search).get('lang') as Lang | null)
					: null;
			const saved = safeLocalStorage.get('lang') as Lang | null;
			if (queryLang === 'uk' || queryLang === 'en') {
				this.current = queryLang;
			} else if (saved === 'uk' || saved === 'en') {
				this.current = saved;
			} else {
				const navLang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'uk';
				this.current = navLang.startsWith('uk') ? 'uk' : 'en';
			}
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'uk' ? 'en' : 'uk';
		this.apply();
	}

	set(lang: Lang) {
		if (lang === 'uk' || lang === 'en') {
			this.current = lang;
			this.apply();
		}
	}

	apply() {
		if (!browser || typeof document === 'undefined') return;
		document.documentElement.setAttribute('lang', this.current);
		safeLocalStorage.set('lang', this.current);
	}

	t(key: TranslationKey): string {
		return TRANSLATIONS[this.current][key] ?? TRANSLATIONS.uk[key] ?? key;
	}
}

export const langStore = new LangStore();
