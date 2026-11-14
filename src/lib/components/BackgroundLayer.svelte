<script lang="ts">
	import { base } from '$app/paths';
	import { bgStore } from '../controllers/background.svelte';

	const isImageMode = $derived(bgStore.mode === 'image');
	const overlayAlpha = $derived(bgStore.currentOpacity / 100);
	const bgUrl = `${base}/bg/vetcrew-bg.webp`;
	const solidBg = $derived(bgStore.currentSolidColor);
	const overlayBg = $derived(bgStore.currentOverlayColor);
</script>

<div
	class="bg-container"
	class:mode-image={isImageMode}
	class:mode-solid={!isImageMode}
	style:background-color={!isImageMode ? solidBg : undefined}
	aria-hidden="true"
	data-testid="background-layer"
>
	{#if isImageMode}
		<div
			class="bg-image-layer"
			style:background-image="url('{bgUrl}')"
			style:--bg-blur="{bgStore.blur}px"
		></div>
		<div
			class="bg-overlay-layer"
			style:background-color={overlayBg}
			style:opacity={overlayAlpha}
		></div>
	{/if}
</div>

<style>
	.bg-container {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
		transition: background-color 0.3s ease;
	}

	.bg-image-layer {
		position: absolute;
		/* Negative margin + scale to prevent transparent blur artifacts at viewport edges */
		inset: -28px;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		filter: blur(var(--bg-blur, 0px));
		transform: scale(1.06) translateZ(0);
		will-change: filter, transform;
		transition: filter 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@media (max-width: 900px), (orientation: portrait) {
		.bg-image-layer {
			background-position: right center;
		}
	}

	.bg-overlay-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition:
			opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
			background-color 0.3s ease;
		will-change: opacity, background-color;
	}

	@media (prefers-reduced-motion: reduce) {
		.bg-container,
		.bg-image-layer,
		.bg-overlay-layer {
			transition: none !important;
		}
	}
</style>
