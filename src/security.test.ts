import { describe, it, expect } from 'vitest';
import { STORAGE_PREFIX } from '$lib/services/storage';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

describe('Security & Storage Isolation (SECURITY-v10 & STORAGE-NAMESPACE-v10)', () => {
	it('storage prefix is unique and ends with an underscore', () => {
		expect(STORAGE_PREFIX).toMatch(/^vetcrew(-dev)?_$/);
		expect(STORAGE_PREFIX.endsWith('_')).toBe(true);
	});

	it('no unescaped {@html} tags in svelte components except permitted static icons', () => {
		function scanDir(dir: string, fileList: string[] = []): string[] {
			const files = readdirSync(dir);
			for (const file of files) {
				const fullPath = join(dir, file);
				if (statSync(fullPath).isDirectory()) {
					if (!fullPath.includes('node_modules') && !fullPath.includes('.svelte-kit')) {
						scanDir(fullPath, fileList);
					}
				} else if (file.endsWith('.svelte')) {
					fileList.push(fullPath);
				}
			}
			return fileList;
		}

		const svelteFiles = scanDir(
			new URL('./', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
		);
		for (const file of svelteFiles) {
			const content = readFileSync(file, 'utf8');
			const htmlMatches = content.match(/\{@html\s+([^}]+)\}/g);
			if (htmlMatches) {
				for (const match of htmlMatches) {
					expect(match).not.toMatch(/user|input|query|url/i);
				}
			}
		}
	});
});
