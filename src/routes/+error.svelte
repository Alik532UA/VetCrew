<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { langStore } from '$lib/lang.svelte';
	import { themeStore } from '$lib/theme.svelte';

	let status = $derived(page.status || 404);
	let is404 = $derived(status === 404);
</script>

<svelte:head>
	<title
		>{status} — {langStore.current === 'uk' ? 'Сторінку не знайдено' : 'Page Not Found'} · Vet Crew</title
	>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="error-page-container">
	<!-- Top Bar -->
	<header class="error-topbar">
		<a href="{base}/" class="brand-link" aria-label="Vet Crew">
			<span class="brand-wordmark">VET CREW</span>
		</a>
		<div class="top-controls">
			<button
				type="button"
				class="ctrl-btn"
				onclick={() => themeStore.toggle()}
				aria-label={langStore.current === 'uk' ? 'Змінити тему' : 'Toggle theme'}
				title={langStore.current === 'uk' ? 'Змінити тему' : 'Toggle theme'}
			>
				{#if themeStore.current === 'dark'}
					<!-- Sun icon -->
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					</svg>
				{:else}
					<!-- Moon icon -->
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					</svg>
				{/if}
			</button>
			<button
				type="button"
				class="ctrl-btn lang-btn"
				onclick={() => langStore.toggle()}
				aria-label={langStore.current === 'uk' ? 'Switch to English' : 'Перемкнути на українську'}
				title={langStore.current === 'uk' ? 'Switch to English' : 'Перемкнути на українську'}
			>
				<span class="lang-text">{langStore.current === 'uk' ? 'EN' : 'UA'}</span>
			</button>
		</div>
	</header>

	<!-- Main Card -->
	<main class="error-main">
		<div class="error-card">
			<div class="status-pill">{status}</div>
			<h1 class="error-title">
				{is404
					? langStore.current === 'uk'
						? 'Сторінку не знайдено'
						: 'Page Not Found'
					: langStore.current === 'uk'
						? 'Непередбачена помилка'
						: 'Unexpected Error'}
			</h1>
			<p class="error-desc">
				{is404
					? langStore.current === 'uk'
						? 'Адресу введено з помилкою або сторінку було переміщено.'
						: 'The page you are looking for might have been moved or the URL is incorrect.'
					: langStore.current === 'uk'
						? 'Сталася помилка при завантаженні. Спробуйте повернутися на головну.'
						: 'An unexpected issue occurred. Please return to the homepage.'}
			</p>

			<div class="btn-group">
				<a href="{base}/" class="home-btn">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
					</svg>
					<span>{langStore.current === 'uk' ? 'На головну' : 'Go to Homepage'}</span>
				</a>
			</div>

			<!-- Official Links Callout -->
			<div class="emergency-box">
				<div class="emergency-badge">
					{langStore.current === 'uk' ? 'Офіційні канали' : 'Official Channels'}
				</div>
				<div class="emergency-links">
					<a
						href="https://vet-crew-donation.org"
						target="_blank"
						rel="noopener noreferrer"
						class="emergency-btn phone-call-btn"
						style="background: #ffb327; color: #000;"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
							/>
						</svg>
						<span>{langStore.current === 'uk' ? 'Підтримати (Донат)' : 'Support (Donate)'}</span>
					</a>
					<div class="sub-links">
						<a
							href="https://www.instagram.com/vet.crew/"
							target="_blank"
							rel="noopener noreferrer"
							class="sub-btn"
							title="Instagram"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
								<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
								<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
							</svg>
							<span>@vet.crew</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.error-page-container {
		position: relative;
		z-index: 2;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 24px 20px 40px;
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	.error-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding-bottom: 24px;
	}

	.brand-link {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		line-height: 1.1;
		transition: opacity 0.2s ease;
	}

	.brand-link:hover {
		opacity: 0.85;
	}

	.brand-wordmark {
		font-family: 'InGlobal', sans-serif;
		font-weight: 700;
		font-size: 1.25rem;
		letter-spacing: 0.04em;
		color: var(--brand-gold);
	}

	.top-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ctrl-btn {
		background: var(--panel-bg);
		border: 1px solid var(--border);
		color: var(--text-primary);
		border-radius: 9999px;
		padding: 8px 12px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s ease;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.ctrl-btn:hover {
		border-color: var(--border-hover);
		color: var(--brand-gold);
		transform: translateY(-1px);
	}

	.lang-btn {
		min-width: 44px;
	}

	.lang-text {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.error-main {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding: 20px 0;
	}

	.error-card {
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		box-shadow: var(--panel-shadow);
		border-radius: 24px;
		padding: 40px 32px;
		max-width: 540px;
		width: 100%;
		text-align: center;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.status-pill {
		display: inline-block;
		font-family: 'InGlobal', sans-serif;
		font-size: 3rem;
		font-weight: 700;
		line-height: 1;
		color: var(--brand-gold);
		margin-bottom: 12px;
		letter-spacing: 0.02em;
	}

	.error-title {
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 1.45rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 10px;
	}

	.error-desc {
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--text-muted);
		margin: 0 0 28px;
	}

	.btn-group {
		display: flex;
		justify-content: center;
		margin-bottom: 32px;
	}

	.home-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--brand-gold);
		color: #101e14;
		font-weight: 700;
		font-size: 0.95rem;
		padding: 12px 24px;
		border-radius: 9999px;
		text-decoration: none;
		transition: all 0.25s ease;
		box-shadow: 0 4px 18px rgba(255, 179, 39, 0.35);
	}

	.home-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(255, 179, 39, 0.5);
	}

	.emergency-box {
		background: rgba(19, 55, 27, 0.12);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		margin-top: 10px;
	}

	:global([data-theme='dark']) .emergency-box {
		background: rgba(19, 55, 27, 0.35);
	}

	.emergency-badge {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: var(--brand-light-green);
		margin-bottom: 12px;
	}

	.emergency-links {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
	}

	.phone-call-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: rgba(89, 143, 58, 0.18);
		border: 1px solid var(--brand-leaf);
		color: var(--text-primary);
		text-decoration: none;
		font-size: 1.05rem;
		font-weight: 700;
		padding: 10px 22px;
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.phone-call-btn:hover {
		background: var(--brand-leaf);
		color: #ffffff;
		transform: translateY(-1px);
	}

	.sub-links {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-top: 4px;
	}

	.sub-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.sub-btn:hover {
		border-color: var(--border-hover);
		color: var(--text-primary);
	}

	@media (max-width: 600px) {
		.error-card {
			padding: 28px 18px;
		}

		.status-pill {
			font-size: 2.5rem;
		}

		.phone-call-btn {
			font-size: 0.95rem;
			padding: 8px 18px;
		}
	}
</style>
