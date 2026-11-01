// src/lib/debug/ownScope.ts — лише коли збір логів із пристроїв (DEBUGGING § 3): єдиний модуль, що бачить реєстрації воркера, кеші й бази всього origin
import { base } from '$app/paths';
import { STORAGE_PREFIX } from '$lib/services/storagePrefix';

/** `scope` реєстрації абсолютний (`https://host/App/`), `base` — шлях (`/App`): порівнюються адреси. */
export function scopeFor(origin: string, basePath: string): string {
	return new URL(`${basePath}/`, origin).href;
}

/** Свій кеш: власний префікс АБО власний `scope` суфіксом — так іменує кеші Workbox. */
export function isOwnCacheName(
	name: string,
	scope: string,
	prefix: string = STORAGE_PREFIX
): boolean {
	return name.startsWith(prefix) || name.endsWith(scope);
}

/** Своя реєстрація — рівно свій `scope`: превʼю `/App/dev/` і сусід `/App2/` — чужі. */
export function isOwnRegistration(registrationScope: string, scope: string): boolean {
	return registrationScope === scope;
}

const ownScope = (): string => scopeFor(window.location.origin, base);

export async function unregisterOwnServiceWorkers(): Promise<number> {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return 0;
	const scope = ownScope();
	const own = (await navigator.serviceWorker.getRegistrations()).filter((r) =>
		isOwnRegistration(r.scope, scope)
	);
	await Promise.all(own.map((registration) => registration.unregister()));
	return own.length;
}

export async function deleteOwnCaches(): Promise<number> {
	if (typeof window === 'undefined' || !('caches' in window)) return 0;
	const scope = ownScope();
	const own = (await caches.keys()).filter((name) => isOwnCacheName(name, scope));
	await Promise.all(own.map((name) => caches.delete(name)));
	return own.length;
}

/** Бази IndexedDB — лише з префіксом (STORAGE-NAMESPACE § 7); без `databases()` нічого не видаляється. */
export async function deleteOwnDatabases(): Promise<number> {
	if (
		typeof window === 'undefined' ||
		!('indexedDB' in window) ||
		typeof indexedDB.databases !== 'function'
	)
		return 0;
	const own = (await indexedDB.databases())
		.map((db) => db.name ?? '')
		.filter((name) => name.startsWith(STORAGE_PREFIX));
	await Promise.all(
		own.map(
			(name) =>
				new Promise<void>((done) => {
					const request = indexedDB.deleteDatabase(name);
					// `blocked` — відкрите зʼєднання цієї ж сторінки: база зникне після перезавантаження.
					request.onsuccess = request.onerror = request.onblocked = () => done();
				})
		)
	);
	return own.length;
}
