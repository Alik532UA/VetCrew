// src/lib/debug/ownScope.test.ts — лише коли збір логів із пристроїв (DEBUGGING § 3): правило «своє» на справжніх іменах (DEBUGGING § 3.5)
import { describe, expect, it } from 'vitest';
import { STORAGE_PREFIX } from '$lib/services/storage';
import { isOwnCacheName, isOwnRegistration, scopeFor } from './ownScope';

const HOST = 'https://alik532ua.github.io';
const OWN = scopeFor(HOST, '/VetCrew');
/** Префікс — з фасаду, а не рядком: `<PROJECT_PREFIX>` кожного проєкту свій. */
const PREVIEW_PREFIX = `${STORAGE_PREFIX.slice(0, -1)}-dev_`;

describe('своє на спільному origin (DEBUGGING § 3.5)', () => {
	it('scope — адреса з кінцевим слешем', () => {
		expect(OWN).toBe('https://alik532ua.github.io/VetCrew/');
		expect(scopeFor(HOST, '')).toBe('https://alik532ua.github.io/');
	});

	it('кеші: свій передкеш і свій кеш — так; сусід, превʼю й корінь — ні', () => {
		const expected: Record<string, boolean> = {
			[`workbox-precache-v2-${OWN}`]: true,
			[`workbox-runtime-${OWN}`]: true,
			[`${STORAGE_PREFIX}cache-1.4.0`]: true,
			[`workbox-precache-v2-${HOST}/OtherApp/`]: false,
			[`workbox-precache-v2-${HOST}/VetCrew/dev/`]: false,
			[`${PREVIEW_PREFIX}cache-1.4.0`]: false,
			[`workbox-precache-v2-${HOST}/`]: false,
			images: false
		};
		const actual = Object.fromEntries(
			Object.keys(expected).map((name) => [name, isOwnCacheName(name, OWN)])
		);
		expect(actual).toEqual(expected);
	});

	it('реєстрації: лише рівно свій scope', () => {
		expect(isOwnRegistration(OWN, OWN)).toBe(true);
		expect(isOwnRegistration(`${HOST}/VetCrew/dev/`, OWN), 'превʼю вкладене у свій шлях').toBe(false);
		expect(isOwnRegistration(`${HOST}/OtherApp/`, OWN)).toBe(false);
		expect(isOwnRegistration(`${HOST}/`, OWN)).toBe(false);
	});
});

