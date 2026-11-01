<script lang="ts">
	import { base } from '$app/paths';
	import { langStore } from '$lib/lang.svelte';
	import { RefreshCw, Home, AlertTriangle } from 'lucide-svelte';

	interface Props {
		onretry: () => void;
	}

	let { onretry }: Props = $props();

	const isUk = $derived(langStore.current === 'uk');
</script>

<div
	class="error-fallback-container"
	role="alert"
	aria-live="assertive"
	data-testid="render-error-message"
>
	<div class="error-fallback-card">
		<div class="error-icon-box">
			<AlertTriangle size={36} class="warning-icon" aria-hidden="true" />
		</div>

		<h2 class="error-title">
			{isUk ? 'Щось пішло не так' : 'Something went wrong'}
		</h2>

		<p class="error-description">
			{isUk
				? 'Виникла неочікувана помилка при відображенні сторінки. Спробуйте оновити вміст або повернутися на головну.'
				: 'An unexpected error occurred while rendering the page. Try refreshing the content or return home.'}
		</p>

		<div class="error-actions">
			<button
				type="button"
				class="action-btn retry-btn"
				onclick={onretry}
				data-testid="render-error-retry-btn"
			>
				<RefreshCw size={16} aria-hidden="true" />
				<span>{isUk ? 'Спробувати знову' : 'Try again'}</span>
			</button>

			<a href={base || '/'} class="action-btn home-link" data-testid="render-error-home-link">
				<Home size={16} aria-hidden="true" />
				<span>{isUk ? 'На головну' : 'Go Home'}</span>
			</a>
		</div>
	</div>
</div>

<style>
	.error-fallback-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		width: 100%;
		padding: 2rem 1rem;
		box-sizing: border-box;
		position: relative;
		z-index: 10;
	}

	.error-fallback-card {
		max-width: 460px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2.25rem 1.75rem;
		background: var(--panel-bg, rgba(20, 20, 20, 0.85));
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.15));
		border-radius: 20px;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
		color: var(--text-primary, #ffffff);
	}

	.error-icon-box {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 179, 39, 0.12);
		border: 1px solid rgba(255, 179, 39, 0.3);
		margin-bottom: 1.25rem;
	}

	.error-icon-box :global(.warning-icon) {
		color: var(--brand-gold, #ffb327);
	}

	.error-title {
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 0 0.75rem;
		color: var(--text-primary, #ffffff);
	}

	.error-description {
		font-size: 0.92rem;
		line-height: 1.5;
		margin: 0 0 1.75rem;
		color: var(--text-secondary, #a3b899);
	}

	.error-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.5rem 1.25rem;
		border-radius: 12px;
		font-size: 0.88rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.retry-btn {
		background: var(--brand-emerald, #13371b);
		color: #ffffff;
		border: 1px solid var(--brand-leaf, #598f3a);
	}

	.retry-btn:hover {
		background: var(--brand-leaf, #598f3a);
		transform: translateY(-1px);
	}

	.home-link {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary, #ffffff);
		border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.15));
	}

	.home-link:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.action-btn:active {
		transform: scale(0.98);
	}
</style>
