<script lang="ts">
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { themeStore } from '../theme.svelte';
	import { langStore } from '../lang.svelte';
	import { canFullscreen, toggleFullscreen, isFullscreenActive } from '../services/fullscreen';
	import type { HotkeyService } from '$lib/hotkeys/hotkeys';
	import { shortcutLetter } from '$lib/hotkeys/hotkeys';

	interface Props {
		isVisible?: boolean;
	}

	let { isVisible = false }: Props = $props();

	const hotkeys = getContext<HotkeyService | undefined>('hotkeys');

	let isSupported = $state(true);
	let isFullscreen = $state(false);
	let isDark = $derived(themeStore.current === 'dark');

	let isHovered = $state(false);
	let isFocused = $state(false);
	let isPinned = $state(false);

	let showTooltip = $derived(isHovered || isFocused || isPinned);

	function toggleDevStatus() {
		isPinned = !isPinned;
	}

	$effect(() => {
		if (typeof document === 'undefined') return;

		isSupported = canFullscreen();
		isFullscreen = isFullscreenActive();

		function onFsChange() {
			isFullscreen = isFullscreenActive();
		}

		function onDocClick(e: MouseEvent) {
			if (isPinned) {
				const target = e.target as HTMLElement | null;
				if (!target?.closest('.dev-panel-container')) {
					isPinned = false;
				}
			}
		}

		document.addEventListener('fullscreenchange', onFsChange);
		document.addEventListener('webkitfullscreenchange', onFsChange);
		document.addEventListener('click', onDocClick);

		return () => {
			document.removeEventListener('fullscreenchange', onFsChange);
			document.removeEventListener('webkitfullscreenchange', onFsChange);
			document.removeEventListener('click', onDocClick);
		};
	});

	$effect(() => {
		if (!hotkeys || !isVisible) return;

		const popLayer = hotkeys.pushLayer({
			handle(e) {
				if (isPinned && e.code === 'Escape') {
					isPinned = false;
					return true;
				}
				if (shortcutLetter(e) === 'i') {
					toggleDevStatus();
					return true;
				}
				return false;
			}
		});

		return popLayer;
	});
</script>

<nav
	class="hidden-panel-wrapper"
	class:is-visible={isVisible}
	aria-label="Додаткові налаштування"
	aria-hidden={!isVisible}
>
	<!-- 1. Окремий лівий контейнер: У РОЗРОБЦІ -->
	<div class="dev-panel-container action-item-wrap">
		<button
			type="button"
			class="action-item dev-item"
			class:is-active={showTooltip}
			onclick={toggleDevStatus}
			onmouseenter={() => (isHovered = true)}
			onmouseleave={() => (isHovered = false)}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			aria-label="{langStore.t('dev_btn')}: {langStore.t('dev_status_text')}"
			aria-expanded={showTooltip}
			aria-keyshortcuts="i"
		>
			<span class="action-icon-box dev-icon-box">
				<svg
					class="action-icon dev-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2" />
					<line x1="12" y1="16" x2="12" y2="11" stroke="currentColor" stroke-width="2" />
					<circle cx="12" cy="7.75" r="0.9" fill="currentColor" stroke="none" />
				</svg>
			</span>
			<span class="action-title dev-title">{langStore.t('dev_btn')}</span>
		</button>

		<!-- Sleek Neon Capsule Tooltip (matches reference style) -->
		{#if showTooltip}
			<div class="dev-capsule-tooltip" role="status" transition:fade={{ duration: 160 }}>
				<span class="dev-capsule-text">{langStore.t('dev_status_text')}</span>
			</div>
		{/if}
	</div>

	<!-- 2. Основна права капсула: ТЕМА, МОВА, ЕКРАН -->
	<div class="hidden-panel-content">
		<!-- 1. ТЕМА -->
		<button
			type="button"
			class="action-item"
			onclick={() => themeStore.toggle()}
			aria-label="{langStore.t('theme_btn')} ({isDark ? 'Dark' : 'Light'})"
			aria-keyshortcuts="t"
		>
			<span class="action-icon-box">
				{#if isDark}
					<!-- Sun icon -->
					<svg
						class="action-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<line x1="12" y1="2" x2="12" y2="4" />
						<line x1="12" y1="20" x2="12" y2="22" />
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
						<line x1="2" y1="12" x2="4" y2="12" />
						<line x1="20" y1="12" x2="22" y2="12" />
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
					</svg>
				{:else}
					<!-- Moon icon -->
					<svg
						class="action-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{/if}
			</span>
			<span class="action-title">{langStore.t('theme_btn')}</span>
		</button>

		<!-- 2. МОВА -->
		<button
			type="button"
			class="action-item lang-toggle-item"
			onclick={() => langStore.toggle()}
			aria-label="Language: {langStore.t('lang_name')}"
			aria-keyshortcuts="l"
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m5 8 6 6" />
					<path d="m4 14 6-6 2-3" />
					<path d="M2 5h12" />
					<path d="M7 2h1" />
					<path d="m22 22-5-10-5 10" />
					<path d="M14 18h6" />
				</svg>
			</span>
			<span class="action-title">{langStore.t('lang_name')}</span>
		</button>

		<!-- 3. ПОВНИЙ ЕКРАН (якщо підтримується) -->
		{#if isSupported}
			<button
				type="button"
				class="action-item fullscreen-item"
				onclick={toggleFullscreen}
				aria-label={isFullscreen ? langStore.t('fullscreen_exit') : langStore.t('fullscreen')}
				aria-keyshortcuts="f"
			>
				<span class="action-icon-box">
					{#if isFullscreen}
						<svg
							class="action-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
							/>
						</svg>
					{:else}
						<svg
							class="action-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
							/>
						</svg>
					{/if}
				</span>
				<span class="action-title"
					>{isFullscreen ? langStore.t('fullscreen_exit') : langStore.t('fullscreen')}</span
				>
			</button>
		{/if}
	</div>
</nav>

<style>
	.hidden-panel-wrapper {
		position: fixed;
		bottom: 1.5rem;
		left: 0;
		right: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		pointer-events: none;
		opacity: 0;
		transform: translateY(40px) scale(0.96);
		transition:
			transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hidden-panel-wrapper.is-visible {
		pointer-events: auto;
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.dev-panel-container,
	.hidden-panel-content {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--panel-bg);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid var(--panel-border);
		border-radius: 9999px;
		box-shadow: var(--panel-shadow);
	}

	.dev-panel-container {
		padding: 0.65rem 0.85rem;
	}

	.hidden-panel-content {
		gap: 0.35rem;
		padding: 0.65rem 1.15rem;
	}

	.action-item-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 82px;
		gap: 0.35rem;
		padding: 0.45rem 0.5rem;
		border-radius: 9999px;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-secondary);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
		-webkit-user-select: none;
	}

	.action-item:hover {
		color: var(--text-primary);
		background: rgba(19, 55, 27, 0.08);
		border-color: var(--border-hover);
		transform: translateY(-2px);
	}

	:global([data-theme='dark']) .action-item:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.action-icon-box {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.action-item:hover .action-icon-box {
		transform: scale(1.14);
	}

	.action-icon {
		width: 22px;
		height: 22px;
		color: currentColor;
		display: block;
	}

	.action-title {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		white-space: nowrap;
		line-height: 1;
		transition: color 0.25s ease;
	}

	/* DEV BUTTON (AMBER / GOLD NEON HIGHLIGHT) */
	.dev-item {
		color: var(--brand-gold, #ffb327);
	}

	.dev-icon-box {
		color: var(--brand-gold, #ffb327);
		filter: drop-shadow(0 0 6px rgba(255, 179, 39, 0.5));
		transition:
			transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			filter 0.25s ease;
	}

	.dev-item:hover .dev-icon-box,
	.dev-item.is-active .dev-icon-box {
		transform: scale(1.14);
		filter: drop-shadow(0 0 10px rgba(255, 179, 39, 0.9));
	}

	.dev-title {
		color: var(--brand-gold, #ffb327);
		font-weight: 700;
	}

	.dev-item.is-active {
		background: rgba(255, 179, 39, 0.1);
		border-color: rgba(255, 179, 39, 0.35);
		transform: translateY(-2px);
	}

	/* LIGHT THEME DEV BUTTON: Rich dark amber for high contrast & perfect readability */
	:global([data-theme='light']) .dev-item,
	:global([data-theme='light']) .dev-title {
		color: #92400e;
	}

	:global([data-theme='light']) .dev-icon-box {
		color: #92400e;
		filter: drop-shadow(0 1px 2px rgba(146, 64, 14, 0.2));
	}

	:global([data-theme='light']) .dev-item:hover .dev-icon-box,
	:global([data-theme='light']) .dev-item.is-active .dev-icon-box {
		filter: drop-shadow(0 2px 6px rgba(146, 64, 14, 0.35));
	}

	:global([data-theme='light']) .dev-panel-container {
		border-color: rgba(180, 83, 9, 0.3);
		background: rgba(254, 243, 199, 0.45);
	}

	:global([data-theme='light']) .dev-item.is-active {
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(180, 83, 9, 0.4);
	}

	/* NEON CAPSULE TOOLTIP (MINIMALIST PILL MATCHING REFERENCE) */
	.dev-capsule-tooltip {
		position: absolute;
		bottom: calc(100% + 14px);
		left: 50%;
		transform: translateX(-50%);
		padding: 0.55rem 1.15rem;
		background: rgba(12, 22, 14, 0.94);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 179, 39, 0.85);
		border-radius: 10px;
		box-shadow:
			0 0 14px rgba(255, 179, 39, 0.25),
			0 8px 24px rgba(0, 0, 0, 0.55);
		z-index: 100;
		pointer-events: none;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global([data-theme='light']) .dev-capsule-tooltip {
		background: rgba(255, 255, 255, 0.96);
		border: 1.5px solid #d97706;
		box-shadow:
			0 0 14px rgba(217, 119, 6, 0.25),
			0 8px 20px rgba(0, 0, 0, 0.12);
	}

	.dev-capsule-text {
		font-size: 0.85rem;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 0.015em;
		line-height: 1.25;
	}

	:global([data-theme='light']) .dev-capsule-text {
		color: #101e14;
	}

	@media (max-width: 640px) {
		.hidden-panel-wrapper {
			bottom: 0.85rem;
			padding: 0 0.5rem;
			gap: 0.4rem;
			box-sizing: border-box;
		}

		.dev-panel-container {
			padding: 0.45rem 0.5rem;
		}

		.hidden-panel-content {
			gap: 0.2rem;
			padding: 0.45rem 0.6rem;
		}

		.action-item {
			width: 68px;
			padding: 0.35rem 0.35rem;
		}

		.action-icon-box {
			width: 28px;
			height: 28px;
		}

		.action-icon {
			width: 20px;
			height: 20px;
		}

		.action-title {
			font-size: 0.68rem;
		}

		.dev-capsule-tooltip {
			white-space: normal;
			text-align: center;
			width: max-content;
			max-width: 260px;
			font-size: 0.78rem;
			padding: 0.45rem 0.85rem;
			bottom: calc(100% + 10px);
		}

		.dev-capsule-text {
			font-size: 0.78rem;
		}
	}

	@media (max-width: 380px) {
		.action-item {
			width: 58px;
			padding: 0.3rem 0.2rem;
		}

		.action-title {
			font-size: 0.62rem;
		}
	}
</style>
