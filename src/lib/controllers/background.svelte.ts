import { browser } from '$app/environment';
import { safeLocalStorage } from '../services/storage';
import { themeStore } from './theme.svelte';

export type BackgroundMode = 'image' | 'solid';

export interface BrandColorSwatch {
	hex: string;
	nameUk: string;
	nameEn: string;
}

export const BRAND_SWATCHES: readonly BrandColorSwatch[] = [
	{ hex: '#070E09', nameUk: 'Темний фірмовий', nameEn: 'Dark Base' },
	{ hex: '#13371B', nameUk: 'Темно-зелений', nameEn: 'Dark Green' },
	{ hex: '#598F3A', nameUk: 'Трав’яний зелений', nameEn: 'Leaf Green' },
	{ hex: '#93C84A', nameUk: 'Світло-зелений', nameEn: 'Lime Green' },
	{ hex: '#FFB327', nameUk: 'Брендове золото', nameEn: 'Brand Gold' },
	{ hex: '#262626', nameUk: 'Графітовий', nameEn: 'Dark Gray' },
	{ hex: '#E5E5E5', nameUk: 'Світло-сірий', nameEn: 'Light Gray' },
	{ hex: '#F5F8F5', nameUk: 'Світлий фірмовий', nameEn: 'Light Base' },
	{ hex: '#000000', nameUk: 'Чорний', nameEn: 'Pure Black' },
	{ hex: '#FFFFFF', nameUk: 'Білий', nameEn: 'Pure White' }
] as const;

export interface BackgroundSettings {
	mode: BackgroundMode;
	blur: number;
	lightOpacity: number;
	darkOpacity: number;
	lightOverlayColor: string;
	darkOverlayColor: string;
	lightSolidColor: string;
	darkSolidColor: string;
	showMenuCapsule: boolean;
}

export const DEFAULT_BG_SETTINGS: Readonly<BackgroundSettings> = {
	mode: 'image',
	blur: 0,
	lightOpacity: 65,
	darkOpacity: 50,
	lightOverlayColor: '#FFFFFF',
	darkOverlayColor: '#000000',
	lightSolidColor: '#F5F8F5',
	darkSolidColor: '#070E09',
	showMenuCapsule: true
};

const STORAGE_KEY = 'bg_settings';

class BackgroundStore {
	mode = $state<BackgroundMode>(DEFAULT_BG_SETTINGS.mode);
	blur = $state<number>(DEFAULT_BG_SETTINGS.blur);
	lightOpacity = $state<number>(DEFAULT_BG_SETTINGS.lightOpacity);
	darkOpacity = $state<number>(DEFAULT_BG_SETTINGS.darkOpacity);
	lightOverlayColor = $state<string>(DEFAULT_BG_SETTINGS.lightOverlayColor);
	darkOverlayColor = $state<string>(DEFAULT_BG_SETTINGS.darkOverlayColor);
	lightSolidColor = $state<string>(DEFAULT_BG_SETTINGS.lightSolidColor);
	darkSolidColor = $state<string>(DEFAULT_BG_SETTINGS.darkSolidColor);
	showMenuCapsule = $state<boolean>(DEFAULT_BG_SETTINGS.showMenuCapsule);
	isPanelOpen = $state<boolean>(false);

	constructor() {
		if (browser) {
			this.hydrate();
		}
	}

	private hydrate(): void {
		try {
			const raw = safeLocalStorage.get(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<BackgroundSettings>;
				if (parsed.mode === 'image' || parsed.mode === 'solid') {
					this.mode = parsed.mode;
				}
				if (typeof parsed.blur === 'number' && Number.isFinite(parsed.blur)) {
					this.blur = Math.min(20, Math.max(0, Math.round(parsed.blur)));
				}
				if (typeof parsed.lightOpacity === 'number' && Number.isFinite(parsed.lightOpacity)) {
					this.lightOpacity = Math.min(100, Math.max(0, Math.round(parsed.lightOpacity)));
				}
				if (typeof parsed.darkOpacity === 'number' && Number.isFinite(parsed.darkOpacity)) {
					this.darkOpacity = Math.min(100, Math.max(0, Math.round(parsed.darkOpacity)));
				}
				if (
					typeof parsed.lightOverlayColor === 'string' &&
					/^#[0-9a-f]{3,8}$/i.test(parsed.lightOverlayColor)
				) {
					this.lightOverlayColor = parsed.lightOverlayColor;
				}
				if (
					typeof parsed.darkOverlayColor === 'string' &&
					/^#[0-9a-f]{3,8}$/i.test(parsed.darkOverlayColor)
				) {
					this.darkOverlayColor = parsed.darkOverlayColor;
				}
				if (
					typeof parsed.lightSolidColor === 'string' &&
					/^#[0-9a-f]{3,8}$/i.test(parsed.lightSolidColor)
				) {
					this.lightSolidColor = parsed.lightSolidColor;
				}
				if (
					typeof parsed.darkSolidColor === 'string' &&
					/^#[0-9a-f]{3,8}$/i.test(parsed.darkSolidColor)
				) {
					this.darkSolidColor = parsed.darkSolidColor;
				}
				if (typeof parsed.showMenuCapsule === 'boolean') {
					this.showMenuCapsule = parsed.showMenuCapsule;
				}
			}
		} catch {
			// Fallback to default values if JSON is corrupted
		}
	}

	private save(): void {
		if (!browser) return;
		const payload: BackgroundSettings = {
			mode: this.mode,
			blur: this.blur,
			lightOpacity: this.lightOpacity,
			darkOpacity: this.darkOpacity,
			lightOverlayColor: this.lightOverlayColor,
			darkOverlayColor: this.darkOverlayColor,
			lightSolidColor: this.lightSolidColor,
			darkSolidColor: this.darkSolidColor,
			showMenuCapsule: this.showMenuCapsule
		};
		safeLocalStorage.set(STORAGE_KEY, JSON.stringify(payload));
	}

	get currentOpacity(): number {
		return themeStore.current === 'dark' ? this.darkOpacity : this.lightOpacity;
	}

	get currentOverlayColor(): string {
		return themeStore.current === 'dark' ? this.darkOverlayColor : this.lightOverlayColor;
	}

	get currentSolidColor(): string {
		return themeStore.current === 'dark' ? this.darkSolidColor : this.lightSolidColor;
	}

	get defaultOpacityForCurrentTheme(): number {
		return themeStore.current === 'dark'
			? DEFAULT_BG_SETTINGS.darkOpacity
			: DEFAULT_BG_SETTINGS.lightOpacity;
	}

	get defaultOverlayColorForCurrentTheme(): string {
		return themeStore.current === 'dark'
			? DEFAULT_BG_SETTINGS.darkOverlayColor
			: DEFAULT_BG_SETTINGS.lightOverlayColor;
	}

	get defaultSolidColorForCurrentTheme(): string {
		return themeStore.current === 'dark'
			? DEFAULT_BG_SETTINGS.darkSolidColor
			: DEFAULT_BG_SETTINGS.lightSolidColor;
	}

	setMode(mode: BackgroundMode): void {
		this.mode = mode;
		this.save();
	}

	setBlur(px: number): void {
		this.blur = Math.min(20, Math.max(0, Math.round(px)));
		this.save();
	}

	setOpacity(percent: number): void {
		const clamped = Math.min(100, Math.max(0, Math.round(percent)));
		if (themeStore.current === 'dark') {
			this.darkOpacity = clamped;
		} else {
			this.lightOpacity = clamped;
		}
		this.save();
	}

	setOverlayColor(color: string): void {
		if (themeStore.current === 'dark') {
			this.darkOverlayColor = color;
		} else {
			this.lightOverlayColor = color;
		}
		this.save();
	}

	setSolidColor(color: string): void {
		if (themeStore.current === 'dark') {
			this.darkSolidColor = color;
		} else {
			this.lightSolidColor = color;
		}
		this.save();
	}

	reset(): void {
		this.mode = DEFAULT_BG_SETTINGS.mode;
		this.blur = DEFAULT_BG_SETTINGS.blur;
		this.lightOpacity = DEFAULT_BG_SETTINGS.lightOpacity;
		this.darkOpacity = DEFAULT_BG_SETTINGS.darkOpacity;
		this.lightOverlayColor = DEFAULT_BG_SETTINGS.lightOverlayColor;
		this.darkOverlayColor = DEFAULT_BG_SETTINGS.darkOverlayColor;
		this.lightSolidColor = DEFAULT_BG_SETTINGS.lightSolidColor;
		this.darkSolidColor = DEFAULT_BG_SETTINGS.darkSolidColor;
		this.showMenuCapsule = DEFAULT_BG_SETTINGS.showMenuCapsule;
		this.save();
	}

	setShowMenuCapsule(show: boolean): void {
		this.showMenuCapsule = show;
		this.save();
	}

	toggleShowMenuCapsule(): void {
		this.showMenuCapsule = !this.showMenuCapsule;
		this.save();
	}

	togglePanel(): void {
		this.isPanelOpen = !this.isPanelOpen;
	}

	openPanel(): void {
		this.isPanelOpen = true;
	}

	closePanel(): void {
		this.isPanelOpen = false;
	}
}

export const bgStore = new BackgroundStore();
