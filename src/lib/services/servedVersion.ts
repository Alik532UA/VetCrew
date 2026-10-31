// src/lib/services/servedVersion.ts — перевірка версії на сервері (VERSIONING-v10 § 2.2)
import { browser } from '$app/environment';
import { base } from '$app/paths';
import { logService } from './logService.svelte';

export async function fetchServedVersion(signal?: AbortSignal): Promise<string | null> {
	if (!browser || !navigator.onLine) return null;
	try {
		const res = await fetch(`${base}/app-version.json?t=${Date.now()}`, {
			cache: 'no-store',
			signal
		});
		if (!res.ok) {
			logService.warn('version', `Failed to fetch served version: ${res.status}`);
			return null;
		}
		const data = (await res.json()) as { version?: string };
		return data.version ?? null;
	} catch (error) {
		if (signal?.aborted) return null;
		logService.warn('version', 'Could not check server version', error);
		return null;
	}
}

