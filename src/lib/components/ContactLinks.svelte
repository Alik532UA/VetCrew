<script lang="ts">
	import { langStore } from '../lang.svelte';
	import { bgStore } from '../controllers/background.svelte';

	interface Props {
		isExpanded?: boolean;
		isShiftedUp?: boolean;
	}

	let { isExpanded = false, isShiftedUp = false }: Props = $props();

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
			getTooltip: () => 'instagram.com/vet.crew',
			brandColor: '#e1306c',
			brandGlow: 'rgba(225, 48, 108, 0.65)',
			svg: `<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>`
		},
		{
			id: 'facebook',
			name: 'Facebook',
			isLink: true,
			getUrl: () => 'https://www.facebook.com/vet.crew/',
			getName: () => langStore.t('btn_facebook'),
			getSublabel: () => langStore.t('btn_facebook_display'),
			getTooltip: () => 'facebook.com/vet.crew',
			brandColor: '#1877f2',
			brandGlow: 'rgba(24, 119, 242, 0.65)',
			svg: `<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M15 22V13.9999H17.0762C17.5066 13.9999 17.8887 13.7245 18.0249 13.3161L18.4679 11.9871C18.6298 11.5014 18.2683 10.9999 17.7564 10.9999H15V8.99992C15 8.49992 15.5 7.99992 16 7.99992H18C18.5523 7.99992 19 7.5522 19 6.99992V6.31393C19 5.99091 18.7937 5.7013 18.4813 5.61887C17.1705 5.27295 16 5.27295 16 5.27295C13.5 5.27295 12 6.99992 12 8.49992V10.9999H10C9.44772 10.9999 9 11.4476 9 11.9999V12.9999C9 13.5522 9.44771 13.9999 10 13.9999H12V22H15Z" fill="currentColor" stroke="none"/>`
		},
		{
			id: 'tiktok',
			name: 'TikTok',
			isLink: true,
			getUrl: () => 'https://www.tiktok.com/@vet.crew',
			getName: () => langStore.t('btn_tiktok'),
			getSublabel: () => langStore.t('btn_tiktok_display'),
			getTooltip: () => 'tiktok.com/@vet.crew',
			brandColor: '#00f2fe',
			brandGlow: 'rgba(0, 242, 254, 0.65)',
			svg: `<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9"/>`
		}
	];
</script>

<div class="contact-container" class:is-expanded={isExpanded} class:is-shifted-up={isShiftedUp}>
	<nav
		class="contact-links"
		class:has-capsule={bgStore.showMenuCapsule}
		aria-label="Vet Crew Actions"
	>
		{#each channels as item (item.id)}
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
		{/each}
	</nav>
</div>

<style>
	.contact-container {
		position: fixed;
		bottom: 2.25rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 50;
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
		transform: translateY(-105px);
	}

	.contact-links {
		display: grid;
		grid-template-columns: repeat(4, 96px);
		justify-items: center;
		align-items: center;
		padding: 0.25rem 1rem;
		pointer-events: auto;
		border: 1px solid transparent;
		border-radius: 9999px;
		transition:
			grid-template-columns 0.6s cubic-bezier(0.16, 1, 0.3, 1),
			padding 0.45s cubic-bezier(0.16, 1, 0.3, 1),
			background-color 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.contact-links.has-capsule {
		background: var(--panel-bg);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-color: var(--panel-border);
		box-shadow: var(--panel-shadow);
		padding: 0.55rem 1rem;
	}

	.is-expanded .contact-links {
		grid-template-columns: repeat(4, 136px);
	}

	.is-expanded .contact-links.has-capsule {
		padding: 0.75rem 1.25rem 0.85rem;
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

	@media (max-width: 768px), (pointer: coarse) {
		.contact-container {
			bottom: 1.45rem;
			left: 0;
			right: 0;
			max-width: 100vw;
		}

		.contact-container.is-expanded {
			bottom: 1.85rem;
		}

		.contact-container.is-shifted-up {
			transform: translateY(-115px);
		}

		.contact-links {
			grid-template-columns: repeat(4, minmax(62px, 78px));
			gap: 0;
			padding: 0.2rem 0.25rem;
		}

		.contact-links.has-capsule {
			padding: 0.35rem 0.5rem;
		}

		.is-expanded .contact-links {
			grid-template-columns: repeat(4, minmax(66px, 82px));
			gap: 0;
			padding: 0.25rem 0.25rem;
		}

		.is-expanded .contact-links.has-capsule {
			padding: 0.45rem 0.65rem 0.55rem;
		}

		.link-item {
			padding: 4px 2px;
			flex-shrink: 0;
			container-type: inline-size;
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
