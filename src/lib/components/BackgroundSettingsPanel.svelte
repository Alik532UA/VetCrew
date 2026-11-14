<script lang="ts">
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';
	import { SlidersHorizontal, Image, X, RotateCcw, Paintbrush, Pipette } from 'lucide-svelte';
	import { bgStore, BRAND_SWATCHES } from '../controllers/background.svelte';
	import { themeStore } from '../controllers/theme.svelte';
	import { langStore } from '../controllers/lang.svelte';
	import { createKeySequence } from '../debug/keySequence';

	const sequence = createKeySequence({
		letter: 's',
		threshold: 7,
		windowMs: 2000,
		onComplete: () => {
			bgStore.togglePanel();
		}
	});

	let panelElement = $state<HTMLDivElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (bgStore.isPanelOpen) {
			void tick().then(() => {
				closeButton?.focus();
			});
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (bgStore.isPanelOpen && event.code === 'Escape') {
			bgStore.closePanel();
			event.preventDefault();
			return;
		}

		if (sequence.handle(event)) {
			event.preventDefault();
		}
	}

	function handlePointerDown(event: PointerEvent) {
		if (!bgStore.isPanelOpen) return;
		const target = event.target as Node | null;
		if (panelElement && target && !panelElement.contains(target)) {
			bgStore.closePanel();
		}
	}

	const isEn = $derived(langStore.current === 'en');
	const isDark = $derived(themeStore.current === 'dark');
	const activeThemeName = $derived(
		isDark ? langStore.t('bg_overlay_theme_dark') : langStore.t('bg_overlay_theme_light')
	);

	function isBright(hex: string): boolean {
		const c = hex.replace('#', '');
		if (c.length < 6) return true;
		const r = parseInt(c.substring(0, 2), 16) || 0;
		const g = parseInt(c.substring(2, 4), 16) || 0;
		const b = parseInt(c.substring(4, 6), 16) || 0;
		return (r * 299 + g * 587 + b * 114) / 1000 > 145;
	}
</script>

<svelte:window onkeydown={handleKeydown} onpointerdown={handlePointerDown} />

{#if bgStore.isPanelOpen}
	<!-- Floating Settings Modal/Card (No dimming or blur backdrop, so the background state is 100% visible) -->
	<div
		bind:this={panelElement}
		class="bg-settings-card"
		role="dialog"
		aria-modal="false"
		aria-label={langStore.t('bg_settings_title')}
		data-testid="bg-settings-panel"
		transition:scale={{ duration: 180, start: 0.96 }}
	>
		<!-- Header -->
		<div class="panel-header">
			<div class="panel-title-wrap">
				<SlidersHorizontal size={18} class="title-icon" aria-hidden="true" />
				<h2 class="panel-title">{langStore.t('bg_settings_title')}</h2>
			</div>
			<button
				type="button"
				class="panel-close-btn"
				bind:this={closeButton}
				onclick={() => bgStore.closePanel()}
				aria-label={langStore.t('bg_close_btn')}
				title={langStore.t('bg_close_btn')}
				data-testid="bg-settings-close-btn"
			>
				<X size={16} aria-hidden="true" />
			</button>
		</div>

		<!-- Section 1: Mode Switch (Photo vs Solid) -->
		<div class="mode-switch-group" role="group" aria-label={langStore.t('bg_settings_title')}>
			<button
				type="button"
				class="mode-btn"
				class:active={bgStore.mode === 'image'}
				aria-pressed={bgStore.mode === 'image'}
				onclick={() => bgStore.setMode('image')}
				data-testid="bg-mode-image-btn"
			>
				<Image size={15} aria-hidden="true" />
				<span class="mode-text">{langStore.t('bg_mode_photo')}</span>
			</button>
			<button
				type="button"
				class="mode-btn"
				class:active={bgStore.mode === 'solid'}
				aria-pressed={bgStore.mode === 'solid'}
				onclick={() => bgStore.setMode('solid')}
				data-testid="bg-mode-solid-btn"
			>
				<Paintbrush size={15} aria-hidden="true" />
				<span class="mode-text">{langStore.t('bg_mode_solid')}</span>
			</button>
		</div>

		{#if bgStore.mode === 'solid'}
			<!-- Section 2: Solid Color Selection -->
			<div class="ctrl-section">
				<div class="ctrl-row">
					<span class="ctrl-label">{langStore.t('bg_solid_color_label')}</span>
					<div class="color-tag-wrap">
						<span
							class="color-dot"
							style:background-color={bgStore.currentSolidColor}
							aria-hidden="true"
						></span>
						<strong class="ctrl-val">{bgStore.currentSolidColor.toUpperCase()}</strong>
					</div>
				</div>

				<div class="swatches-grid" role="group" aria-label={langStore.t('bg_solid_color_label')}>
					{#each BRAND_SWATCHES as swatch (swatch.hex)}
						{@const isSelected =
							bgStore.currentSolidColor.toLowerCase() === swatch.hex.toLowerCase()}
						<button
							type="button"
							class="swatch-btn"
							class:active={isSelected}
							style:background-color={swatch.hex}
							onclick={() => bgStore.setSolidColor(swatch.hex)}
							title={isEn ? swatch.nameEn : swatch.nameUk}
							aria-label={isEn ? swatch.nameEn : swatch.nameUk}
							aria-pressed={isSelected}
							data-testid={`bg-solid-${swatch.hex.replace('#', '')}-btn`}
						>
							{#if isSelected}
								<span
									class="swatch-check"
									style:color={isBright(swatch.hex) ? '#070e09' : '#ffffff'}
									aria-hidden="true">✓</span
								>
							{/if}
						</button>
					{/each}

					<!-- Custom color picker -->
					<label
						class="swatch-btn swatch-custom"
						title={langStore.t('bg_custom_color')}
						aria-label={langStore.t('bg_custom_color')}
					>
						<Pipette size={14} class="custom-pipette-icon" aria-hidden="true" />
						<input
							type="color"
							class="native-color-input"
							value={bgStore.currentSolidColor}
							oninput={(e) => bgStore.setSolidColor(e.currentTarget.value)}
							data-testid="bg-solid-custom-color-input"
						/>
					</label>
				</div>
			</div>
		{:else}
			<!-- Section 2: Image Blur Slider -->
			<div class="ctrl-section">
				<div class="ctrl-row">
					<label for="bg-blur-slider" class="ctrl-label">
						{langStore.t('bg_blur_label')}
						<strong class="ctrl-val">{bgStore.blur}px</strong>
					</label>
					{#if bgStore.blur !== 0}
						<button
							type="button"
							class="reset-badge-btn"
							onclick={() => bgStore.setBlur(0)}
							title="0px"
							data-testid="bg-blur-reset-btn"
						>
							0px
						</button>
					{/if}
				</div>
				<input
					id="bg-blur-slider"
					type="range"
					min="0"
					max="20"
					step="1"
					value={bgStore.blur}
					oninput={(e) => bgStore.setBlur(Number(e.currentTarget.value))}
					class="ctrl-slider"
					data-testid="bg-blur-slider"
				/>
			</div>

			<!-- Section 3: Overlay (Пелена) Color Selection -->
			<div class="ctrl-section">
				<div class="ctrl-row">
					<span class="ctrl-label">{langStore.t('bg_overlay_color_label')}</span>
					<div class="color-tag-wrap">
						<span
							class="color-dot"
							style:background-color={bgStore.currentOverlayColor}
							aria-hidden="true"
						></span>
						<strong class="ctrl-val">{bgStore.currentOverlayColor.toUpperCase()}</strong>
					</div>
				</div>

				<div class="swatches-grid" role="group" aria-label={langStore.t('bg_overlay_color_label')}>
					{#each BRAND_SWATCHES as swatch (swatch.hex)}
						{@const isSelected =
							bgStore.currentOverlayColor.toLowerCase() === swatch.hex.toLowerCase()}
						<button
							type="button"
							class="swatch-btn"
							class:active={isSelected}
							style:background-color={swatch.hex}
							onclick={() => bgStore.setOverlayColor(swatch.hex)}
							title={isEn ? swatch.nameEn : swatch.nameUk}
							aria-label={isEn ? swatch.nameEn : swatch.nameUk}
							aria-pressed={isSelected}
							data-testid={`bg-overlay-${swatch.hex.replace('#', '')}-btn`}
						>
							{#if isSelected}
								<span
									class="swatch-check"
									style:color={isBright(swatch.hex) ? '#070e09' : '#ffffff'}
									aria-hidden="true">✓</span
								>
							{/if}
						</button>
					{/each}

					<!-- Custom overlay color picker -->
					<label
						class="swatch-btn swatch-custom"
						title={langStore.t('bg_custom_color')}
						aria-label={langStore.t('bg_custom_color')}
					>
						<Pipette size={14} class="custom-pipette-icon" aria-hidden="true" />
						<input
							type="color"
							class="native-color-input"
							value={bgStore.currentOverlayColor}
							oninput={(e) => bgStore.setOverlayColor(e.currentTarget.value)}
							data-testid="bg-overlay-custom-color-input"
						/>
					</label>
				</div>
			</div>

			<!-- Section 4: Overlay (Пелена) Density Slider -->
			<div class="ctrl-section">
				<div class="ctrl-row">
					<label for="bg-opacity-slider" class="ctrl-label">
						{langStore.t('bg_overlay_label')}
						<span class="theme-hint">({activeThemeName})</span>
						<strong class="ctrl-val">{bgStore.currentOpacity}%</strong>
					</label>
					{#if bgStore.currentOpacity !== bgStore.defaultOpacityForCurrentTheme}
						<button
							type="button"
							class="reset-badge-btn"
							onclick={() => bgStore.setOpacity(bgStore.defaultOpacityForCurrentTheme)}
							title={`${bgStore.defaultOpacityForCurrentTheme}%`}
							data-testid="bg-opacity-reset-btn"
						>
							{bgStore.defaultOpacityForCurrentTheme}%
						</button>
					{/if}
				</div>
				<input
					id="bg-opacity-slider"
					type="range"
					min="0"
					max="100"
					step="5"
					value={bgStore.currentOpacity}
					oninput={(e) => bgStore.setOpacity(Number(e.currentTarget.value))}
					class="ctrl-slider"
					data-testid="bg-opacity-slider"
				/>
			</div>
		{/if}

		<!-- Section: Main Menu Capsule Toggle -->
		<div class="ctrl-section">
			<div class="ctrl-row">
				<span class="ctrl-label">{langStore.t('bg_menu_capsule_label')}</span>
				<button
					type="button"
					role="switch"
					class="switch-btn"
					class:checked={bgStore.showMenuCapsule}
					aria-checked={bgStore.showMenuCapsule}
					onclick={() => bgStore.toggleShowMenuCapsule()}
					data-testid="bg-menu-capsule-toggle"
					title={bgStore.showMenuCapsule
						? langStore.t('bg_menu_capsule_on')
						: langStore.t('bg_menu_capsule_off')}
				>
					<span class="switch-handle" aria-hidden="true"></span>
				</button>
			</div>
		</div>

		<!-- Footer: Reset all button -->
		<div class="panel-footer">
			<button
				type="button"
				class="reset-all-btn"
				onclick={() => bgStore.reset()}
				data-testid="bg-reset-all-btn"
			>
				<RotateCcw size={14} aria-hidden="true" />
				<span>{langStore.t('bg_reset_all')}</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.bg-settings-card {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 9500;
		width: 336px;
		max-width: calc(100vw - 2rem);
		background: var(--panel-bg);
		color: var(--text-primary);
		border: 1px solid var(--border-hover);
		border-radius: 20px;
		padding: 1.2rem;
		box-shadow:
			var(--panel-shadow),
			0 20px 48px -10px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
		box-sizing: border-box;
		font-family: var(--font-main);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.panel-title-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-primary);
	}

	:global(.title-icon) {
		color: var(--brand-gold);
		flex-shrink: 0;
	}

	.panel-title {
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.panel-close-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--border);
		color: var(--text-secondary);
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.panel-close-btn:hover {
		background: var(--border-hover);
		color: var(--text-primary);
		transform: scale(1.05);
	}

	.mode-switch-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem;
		background: var(--border);
		padding: 0.25rem;
		border-radius: 12px;
	}

	.mode-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.5rem 0.5rem;
		border-radius: 9px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		background: transparent;
		white-space: nowrap;
		transition: all 0.18s ease;
	}

	.mode-text {
		white-space: nowrap;
	}

	.mode-btn:hover {
		color: var(--text-primary);
	}

	.mode-btn.active {
		background: var(--panel-bg);
		color: var(--brand-gold);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
		border: 1px solid var(--border-hover);
	}

	.ctrl-section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.ctrl-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.82rem;
	}

	.ctrl-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.color-tag-wrap {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.color-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1px solid var(--border-hover);
		display: inline-block;
	}

	.theme-hint {
		font-size: 0.72rem;
		opacity: 0.75;
	}

	.ctrl-val {
		color: var(--text-primary);
		font-weight: 700;
	}

	.swatches-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.35rem;
	}

	.swatch-btn {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		border: 2px solid var(--border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		box-sizing: border-box;
	}

	.swatch-btn:hover {
		transform: scale(1.08);
		border-color: var(--border-hover);
	}

	.swatch-btn.active {
		border-color: var(--brand-gold);
		box-shadow: 0 0 8px var(--brand-gold-glow);
		transform: scale(1.1);
		z-index: 2;
	}

	.swatch-check {
		font-size: 0.75rem;
		font-weight: 900;
		line-height: 1;
	}

	.swatch-custom {
		background: conic-gradient(
			from 180deg at 50% 50%,
			#ff0000,
			#ff8000,
			#ffff00,
			#00ff00,
			#00ffff,
			#0000ff,
			#8000ff,
			#ff0080,
			#ff0000
		);
		border-color: var(--border-hover);
		overflow: hidden;
	}

	.swatch-custom:hover {
		border-color: var(--brand-gold);
	}

	:global(.custom-pipette-icon) {
		color: #ffffff;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
		pointer-events: none;
	}

	.native-color-input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		padding: 0;
		margin: 0;
		border: none;
	}

	.reset-badge-btn {
		font-size: 0.72rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 6px;
		background: var(--border);
		color: var(--brand-gold);
		border: 1px solid var(--border-hover);
		transition: all 0.15s ease;
	}

	.reset-badge-btn:hover {
		background: var(--border-hover);
		transform: scale(1.05);
	}

	.ctrl-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: var(--border);
		outline: none;
		cursor: pointer;
		accent-color: var(--brand-gold);
		transition: background 0.2s ease;
	}

	.ctrl-slider:hover {
		background: var(--border-hover);
	}

	.ctrl-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--brand-gold);
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		transition: transform 0.15s ease;
	}

	.ctrl-slider::-webkit-slider-thumb:hover {
		transform: scale(1.15);
	}

	.ctrl-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--brand-gold);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		transition: transform 0.15s ease;
	}

	.ctrl-slider::-moz-range-thumb:hover {
		transform: scale(1.15);
	}

	.switch-btn {
		position: relative;
		width: 44px;
		height: 24px;
		background: var(--border);
		border: 1px solid var(--border-hover);
		border-radius: 9999px;
		cursor: pointer;
		padding: 0;
		outline: none;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.switch-btn:hover {
		border-color: var(--brand-gold);
	}

	.switch-btn:focus-visible {
		outline: 2px solid var(--brand-gold);
		outline-offset: 2px;
	}

	.switch-btn.checked {
		background: var(--brand-gold);
		border-color: var(--brand-gold);
	}

	.switch-handle {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.switch-btn.checked .switch-handle {
		transform: translateX(20px);
		background: #070e09;
	}

	.panel-footer {
		display: flex;
		justify-content: stretch;
		border-top: 1px solid var(--border);
		padding-top: 0.75rem;
	}

	.reset-all-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.55rem;
		border-radius: 10px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
		border: 1px dashed var(--border);
		transition: all 0.2s ease;
	}

	.reset-all-btn:hover {
		color: var(--text-primary);
		border-color: var(--border-hover);
		background: var(--border);
	}

	@media (max-width: 640px) {
		.bg-settings-card {
			top: auto;
			bottom: 1rem;
			right: 1rem;
			left: 1rem;
			width: auto;
			max-width: none;
		}
	}
</style>
