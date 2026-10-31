<script lang="ts">
	import { langStore } from '../lang.svelte';

	interface Props {
		state: 1 | 2 | 3;
		onGoToState: (state: 1 | 2 | 3) => void;
	}

	let { state, onGoToState }: Props = $props();
</script>

<aside class="scroll-indicator" aria-label="Індикатор стану скролу">
	<button
		type="button"
		class="state-dot"
		class:active={state === 1}
		onclick={() => onGoToState(1)}
		aria-label="Слайд 1: Головна"
		title="Слайд 1: Головна"
	>
		<span class="dot-inner"></span>
	</button>

	<button
		type="button"
		class="state-dot"
		class:active={state === 2}
		onclick={() => onGoToState(2)}
		aria-label="Слайд 2: Контакти"
		title="Слайд 2: Контакти"
	>
		<span class="dot-inner"></span>
	</button>

	<button
		type="button"
		class="state-dot"
		class:active={state === 3}
		onclick={() => onGoToState(3)}
		aria-label="Слайд 3: Меню та налаштування"
		title="Слайд 3: Меню та налаштування"
	>
		<span class="dot-inner"></span>
	</button>
</aside>

<style>
	.scroll-indicator {
		position: fixed;
		right: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 60;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 0.6rem 0.4rem;
		background: var(--panel-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-radius: 9999px;
		border: 1px solid var(--border);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		transition: opacity 0.28s ease-out;
	}

	.state-dot {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.dot-inner {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: var(--text-secondary);
		opacity: 0.45;
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.state-dot:hover .dot-inner {
		opacity: 0.9;
		transform: scale(1.3);
	}

	.state-dot.active .dot-inner {
		width: 8px;
		height: 20px;
		opacity: 1;
		background: linear-gradient(180deg, var(--brand-gold) 0%, var(--brand-leaf) 100%);
		box-shadow: 0 0 12px var(--brand-gold-glow);
	}

	@media (max-width: 768px), (pointer: coarse) {
		.scroll-indicator {
			display: none !important;
		}
	}
</style>
