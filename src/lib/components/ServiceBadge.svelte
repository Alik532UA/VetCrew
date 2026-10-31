<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { page } from '$app/state';
	import { Check, Copy, RefreshCw } from 'lucide-svelte';
	import { APP_VERSION } from '../config/version';
	import { logService } from '../services/logService.svelte';
	import { debugMode } from '../debug/debugMode.svelte';
	import { hardReset } from '../debug/hardReset';
	import { createKeySequence } from '../debug/keySequence';
	import { fetchServedVersion } from '../services/servedVersion';

	let copied = $state(false);
	let fallbackReport = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const urlDebug = $derived(browser && page.url.searchParams.get('debug') === '1');
	const isVisible = $derived(urlDebug || debugMode.enabled || logService.errorCount > 0);
	const errors = $derived(logService.errorCount);
	const hasUpdate = $derived(
		Boolean(logService.servedVersion && logService.servedVersion !== APP_VERSION)
	);

	const versionSequence = createKeySequence({
		letter: 'v',
		threshold: () => debugMode.pressesToToggle,
		onComplete: () => {
			const shown = debugMode.toggle();
			logService.info('ui', `ServiceBadge visibility toggled: ${shown}`);
		}
	});

	const resetSequence = createKeySequence({
		letter: 'r',
		threshold: () => (dev ? 5 : 25),
		onComplete: () => {
			const ok = confirm('Скинути всі збережені дані та кеші застосунку?');
			if (ok) void hardReset();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (versionSequence.handle(event) || resetSequence.handle(event)) {
			event.preventDefault();
		}
	}

	$effect(() => {
		if (!browser) return;

		// 1. Початкова перевірка версії на сервері
		void fetchServedVersion().then((served) => {
			if (served) logService.servedVersion = served;
		});

		// 2. Періодичний фоновий моніторинг оновлень кожні 60 секунд
		const pollTimer = setInterval(() => {
			if (navigator.onLine) {
				void fetchServedVersion().then((served) => {
					if (served) logService.servedVersion = served;
				});
			}
		}, 60000);

		return () => {
			clearInterval(pollTimer);
			if (copyTimer) clearTimeout(copyTimer);
		};
	});

	async function copyReport() {
		const report = logService.getReport();
		try {
			await navigator.clipboard.writeText(report);
			fallbackReport = null;
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch (error) {
			logService.warn('ui', 'Clipboard write failed, showing report inline', error);
			fallbackReport = report;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if fallbackReport}
	<div class="service-report-fallback-wrapper">
		<div class="fallback-header">
			<span>Діагностичний звіт</span>
			<button type="button" class="fallback-close" onclick={() => (fallbackReport = null)}>✕</button>
		</div>
		<textarea class="service-report-fallback" readonly value={fallbackReport}></textarea>
	</div>
{/if}

{#if isVisible}
	<button
		type="button"
		class="service-badge"
		class:has-errors={errors > 0}
		class:has-update={hasUpdate}
		class:copied
		onclick={copyReport}
		aria-label="Копіювати звіт діагностики — v{APP_VERSION}"
		title="Скопіювати звіт діагностики (v{APP_VERSION}){hasUpdate ? ` — доступна нова версія v${logService.servedVersion}` : ''}"
		data-testid="service-badge-btn"
	>
		{#if copied}
			<Check size={14} class="badge-icon" aria-hidden="true" />
		{:else if errors > 0}
			<span class="error-count">{errors > 99 ? '99+' : errors}</span>
		{:else if hasUpdate}
			<RefreshCw size={12} class="badge-icon update-icon" aria-hidden="true" />
		{:else}
			<Copy size={12} class="badge-icon" aria-hidden="true" />
		{/if}
		<span class="version-text">v{APP_VERSION}</span>
		{#if hasUpdate}
			<span class="update-badge" title="Доступна нова версія: v{logService.servedVersion}">upd</span>
		{/if}
	</button>
{/if}

<style>
	.service-badge {
		position: fixed;
		bottom: calc(16px + env(safe-area-inset-bottom, 0px));
		left: 16px;
		z-index: 9999;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 10px;
		border-radius: 16px;
		background: var(--panel-bg, rgba(20, 20, 20, 0.85));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: var(--text-primary, #ffffff);
		border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.15));
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease;
	}

	.service-badge:hover {
		transform: scale(1.05);
		border-color: var(--border-hover, rgba(255, 255, 255, 0.3));
	}

	.service-badge:active {
		transform: scale(0.98);
	}

	.version-text {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		white-space: nowrap;
	}

	.service-badge :global(.badge-icon) {
		opacity: 0.75;
		flex-shrink: 0;
	}

	.service-badge.copied {
		background: #1b5e20;
		color: #ffffff;
		border-color: #2e7d32;
	}

	.service-badge.has-errors {
		background: #7f1d1d;
		color: #ffffff;
		border-color: #ef4444;
	}

	.error-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background: #dc2626;
		color: #ffffff;
		font-size: 0.65rem;
		font-weight: 700;
		line-height: 1;
	}

	.update-badge {
		font-size: 0.6rem;
		font-weight: 800;
		text-transform: uppercase;
		padding: 1px 5px;
		border-radius: 6px;
		background: #2563eb;
		color: #ffffff;
		margin-left: 2px;
	}

	.service-report-fallback-wrapper {
		position: fixed;
		bottom: 56px;
		left: 16px;
		z-index: 10000;
		width: min(90vw, 460px);
		background: var(--panel-bg, #1a1a1a);
		border: 1px solid var(--panel-border, #333);
		border-radius: 12px;
		padding: 8px 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	}

	.fallback-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary, #ffffff);
	}

	.fallback-close {
		background: transparent;
		border: none;
		color: var(--text-muted, #888);
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0 4px;
	}

	.fallback-close:hover {
		color: var(--text-primary, #ffffff);
	}

	.service-report-fallback {
		width: 100%;
		height: 140px;
		box-sizing: border-box;
		background: rgba(0, 0, 0, 0.35);
		color: var(--text-primary, #ffffff);
		border: 1px solid var(--panel-border, #444);
		border-radius: 8px;
		padding: 8px;
		font-family: monospace;
		font-size: 0.7rem;
		resize: vertical;
	}
</style>
