<script lang="ts">
	import { langStore } from '../lang.svelte';

	interface Props {
		isExpanded?: boolean;
		isShiftedUp?: boolean;
	}

	let { isExpanded = false, isShiftedUp = false }: Props = $props();

	let isInfoOpen = $state(false);

	function openInfo() {
		isInfoOpen = true;
	}

	function closeInfo() {
		isInfoOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isInfoOpen) {
			closeInfo();
		}
	}

	const channels = [
		{
			id: 'donate',
			name: 'Donation',
			isLink: true,
			getUrl: () => 'https://vet-crew-donation.org',
			getName: () => langStore.t('btn_donate'),
			getSublabel: () => langStore.t('btn_donate_display'),
			getTooltip: () => 'vet-crew-donation.org',
			brandColor: '#ffb327',
			brandGlow: 'rgba(255, 179, 39, 0.65)',
			svg: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`
		},
		{
			id: 'instagram',
			name: 'Instagram',
			isLink: true,
			getUrl: () => 'https://www.instagram.com/vet.crew/',
			getName: () => langStore.t('btn_instagram'),
			getSublabel: () => langStore.t('btn_instagram_display'),
			getTooltip: () => langStore.t('btn_instagram_display'),
			brandColor: '#e1306c',
			brandGlow: 'rgba(225, 48, 108, 0.65)',
			svg: `<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>`
		},
		{
			id: 'info',
			name: 'Info',
			isLink: false,
			getUrl: () => '#',
			getName: () => langStore.t('btn_info'),
			getSublabel: () => langStore.t('btn_info_display'),
			getTooltip: () => langStore.t('dev_warning'),
			brandColor: '#38bdf8',
			brandGlow: 'rgba(56, 189, 248, 0.65)',
			svg: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`
		}
	];
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="contact-container" class:is-expanded={isExpanded} class:is-shifted-up={isShiftedUp}>
	<nav class="contact-links" aria-label="Vet Crew Actions">
		{#each channels as item (item.id)}
			{#if item.isLink}
				<a
					href={item.getUrl()}
					target="_blank"
					rel="noopener noreferrer"
					class="link-item channel-{item.id}"
					style="--brand-color: {item.brandColor}; --brand-glow: {item.brandGlow};"
					aria-label={item.getName()}
				>
					<div class="icon-wrap">
						<svg
							class="contact-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html item.svg}
						</svg>
					</div>
					<span class="link-sublabel">{item.getSublabel()}</span>
					<span class="tooltip">{item.getTooltip()}</span>
				</a>
			{:else}
				<button
					type="button"
					class="link-item channel-{item.id} btn-action"
					style="--brand-color: {item.brandColor}; --brand-glow: {item.brandGlow};"
					onclick={openInfo}
					aria-label={item.getName()}
					aria-haspopup="dialog"
				>
					<div class="icon-wrap">
						<svg
							class="contact-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html item.svg}
						</svg>
					</div>
					<span class="link-sublabel">{item.getSublabel()}</span>
					<span class="tooltip tooltip-wide">{item.getTooltip()}</span>
				</button>
			{/if}
		{/each}
	</nav>
</div>

<!-- Info Modal Popup Dialog -->
{#if isInfoOpen}
	<div class="modal-backdrop" role="presentation" onclick={closeInfo}>
		<div
			class="modal-card"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="modal-title"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-icon-wrap">
				<svg
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="16" x2="12" y2="12" />
					<line x1="12" y1="8" x2="12.01" y2="8" />
				</svg>
			</div>

			<h2 id="modal-title" class="modal-title">Vet Crew</h2>
			<p class="modal-message">{langStore.t('dev_warning')}</p>

			<button type="button" class="modal-close-btn" onclick={closeInfo}>
				{langStore.t('dev_warning_close')}
			</button>
		</div>
	</div>
{/if}

<style>
	.contact-container {
		position: fixed;
		bottom: 2.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		transition:
			transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
			bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.contact-container.is-expanded {
		bottom: 2.75rem;
	}

	.contact-container.is-shifted-up {
		transform: translateX(-50%) translateY(-105px);
	}

	.contact-links {
		display: grid;
		grid-template-columns: repeat(3, 100px);
		justify-items: center;
		align-items: center;
		padding: 0.25rem 1rem;
		pointer-events: auto;
		transition: grid-template-columns 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.is-expanded .contact-links {
		grid-template-columns: repeat(3, 160px);
	}

	.link-item {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		text-decoration: none;
		outline: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition:
			transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			color 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Normal icon: 44px; Expanded: 84px */
	.contact-icon {
		width: 44px;
		height: 44px;
		display: block;
		transition:
			width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
			height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			filter 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12));
	}

	.is-expanded .contact-icon {
		width: 84px;
		height: 84px;
	}

	.link-sublabel {
		display: block;
		margin-top: 10px;
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--fg-primary);
		opacity: 0;
		max-height: 0;
		overflow: hidden;
		transform: translateY(6px);
		transition:
			opacity 0.4s ease,
			transform 0.4s ease,
			max-height 0.4s ease;
		pointer-events: none;
		white-space: nowrap;
	}

	.is-expanded .link-sublabel {
		opacity: 1;
		max-height: 28px;
		transform: translateY(0);
	}

	.is-expanded .tooltip:not(.tooltip-wide) {
		display: none;
	}

	/* On hover: color icon in brand color and add matching glowing aura */
	.link-item:hover .icon-wrap {
		color: var(--brand-color);
		transform: translateY(-4px) scale(1.14);
	}

	.link-item:hover .contact-icon {
		filter: drop-shadow(0 0 22px var(--brand-glow));
	}

	.link-item:focus-visible .icon-wrap {
		transform: scale(1.1);
		color: var(--brand-color);
	}

	.link-item:active .icon-wrap {
		transform: translateY(-1px) scale(1.02);
	}

	.tooltip {
		position: absolute;
		bottom: calc(100% + 14px);
		padding: 6px 14px;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		white-space: nowrap;
		background: var(--bg-secondary);
		color: var(--fg-primary);
		border: 1px solid var(--border);
		border-radius: 8px;
		pointer-events: none;
		opacity: 0;
		transform: translateY(6px) scale(0.95);
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		z-index: 60;
	}

	.tooltip-wide {
		white-space: normal;
		width: max-content;
		max-width: 260px;
		line-height: 1.4;
	}

	.link-item:hover .tooltip {
		opacity: 1;
		transform: translateY(0) scale(1);
		border-color: var(--brand-color);
	}

	/* MODAL STYLES */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: fadeIn 0.25s ease-out forwards;
	}

	.modal-card {
		background: var(--bg-secondary, #131d14);
		border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
		border-radius: 18px;
		padding: 2rem 1.8rem;
		max-width: 380px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		box-shadow:
			0 20px 50px rgba(0, 0, 0, 0.5),
			0 0 30px rgba(56, 189, 248, 0.18);
		animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.modal-icon-wrap {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: rgba(56, 189, 248, 0.14);
		color: #38bdf8;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.1rem;
	}

	.modal-title {
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--fg-primary);
		margin: 0 0 0.6rem 0;
		letter-spacing: -0.01em;
	}

	.modal-message {
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--fg-secondary);
		margin: 0 0 1.6rem 0;
	}

	.modal-close-btn {
		width: 100%;
		padding: 0.75rem 1.25rem;
		border-radius: 10px;
		background: var(--brand-accent, #598f3a);
		color: #ffffff;
		font-size: 0.95rem;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.modal-close-btn:hover {
		filter: brightness(1.12);
		transform: translateY(-1px);
	}

	.modal-close-btn:active {
		transform: translateY(0);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.92) translateY(12px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@media (max-width: 768px), (pointer: coarse) {
		.contact-container {
			bottom: 1.45rem;
			max-width: calc(100vw - 1rem);
			box-sizing: border-box;
		}

		.contact-container.is-expanded {
			bottom: 1.85rem;
		}

		.contact-container.is-shifted-up {
			transform: translateX(-50%) translateY(-115px);
		}

		.contact-links {
			grid-template-columns: repeat(3, minmax(70px, 1fr));
			gap: 0;
			padding: 0.2rem 0.5rem;
		}

		.is-expanded .contact-links {
			grid-template-columns: repeat(3, minmax(88px, 1fr));
			gap: 0;
		}

		.link-item {
			padding: 4px 2px;
			flex-shrink: 0;
			container-type: inline-size;
		}

		.icon-wrap {
			color: var(--fg-primary);
		}

		.contact-icon {
			width: 38px;
			height: 38px;
		}

		.is-expanded .contact-icon {
			width: 52px;
			height: 52px;
		}

		.link-sublabel {
			font-size: clamp(0.5rem, 2.5vw, 0.74rem);
			font-size: clamp(0.5rem, 9.4cqw, 0.74rem);
			letter-spacing: -0.015em;
			margin-top: 6px;
			width: 100%;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: clip;
		}

		.is-expanded .link-sublabel {
			font-size: clamp(0.5rem, 2.5vw, 0.74rem);
			font-size: clamp(0.5rem, 9.4cqw, 0.74rem);
			letter-spacing: -0.015em;
			margin-top: 6px;
			max-height: 24px;
			width: 100%;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: clip;
		}

		.tooltip {
			display: none;
		}
	}
</style>
