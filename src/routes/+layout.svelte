<script lang="ts">
	import '../app.css';
	import { setContext } from 'svelte';
	import { updated } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { themeStore } from '$lib/theme.svelte';
	import { langStore } from '$lib/lang.svelte';
	import { toggleFullscreen } from '$lib/services/fullscreen';
	import { logService } from '$lib/services/logService.svelte';
	import { freshLoad } from '$lib/utils/staleBuild';
	import { HotkeyService } from '$lib/hotkeys/hotkeys';
	import ServiceBadge from '$lib/components/ServiceBadge.svelte';
	import ErrorFallback from '$lib/components/ErrorFallback.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	/**
	 * Автоматичне перезавантаження на свіжу версію при навігації, якщо на сервері
	 * опубліковано новий деплой (VERSIONING-v10 § 6).
	 */
	beforeNavigate((navigation) => {
		if (!updated.current || navigation.willUnload || !navigation.to?.url) return;
		logService.info('app', 'new build - full navigation', { to: navigation.to.url.pathname });
		navigation.cancel();
		void freshLoad(navigation.to.url.href);
	});

	const hotkeys = new HotkeyService({
		theme: () => {
			themeStore.toggle();
			return true;
		},
		language: () => {
			langStore.toggle();
			return true;
		},
		fullscreen: () => {
			toggleFullscreen();
			return true;
		}
	});

	setContext('hotkeys', hotkeys);

	// CODE-QUALITY § 5.3: сигнал гідратації — лише в браузері після монтування
	$effect(() => {
		document.documentElement.dataset.hydrated = '';
		return hotkeys.init(document);
	});
</script>

<a href="#main-content" class="skip-link">{langStore.t('skip_to_content')}</a>

<div class="app-root">
	<!-- Dynamic ambient glow background -->
	<div class="ambient-glow"></div>

	<svelte:boundary
		onerror={(error) =>
			logService.error('app', 'Render boundary caught error', { error: String(error) })}
	>
		{@render children?.()}

		{#snippet failed(_, reset)}
			<ErrorFallback onretry={reset} />
		{/snippet}
	</svelte:boundary>

	<ServiceBadge />
</div>

<style>
	.skip-link {
		position: fixed;
		top: -9999px;
		left: 16px;
		z-index: 10001;
		padding: 8px 16px;
		background: var(--panel-bg, #1a1a1a);
		color: var(--text-primary, #ffffff);
		border: 2px solid var(--accent, #93C84A);
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.85rem;
		text-decoration: none;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		transition: top 0.2s ease;
	}

	.skip-link:focus {
		top: 16px;
	}

	:global(main:focus) {
		outline: none;
	}

	.app-root {
		position: relative;
		width: 100%;
		height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	:global(body:has(.error-page-container)) .app-root {
		height: auto !important;
		min-height: 100vh !important;
		overflow: visible !important;
	}

	.ambient-glow {
		position: fixed;
		inset: 0;
		background-image: var(--bg-radial);
		pointer-events: none;
		z-index: 1;
		transition: background-image 0.15s ease-out;
	}
</style>
