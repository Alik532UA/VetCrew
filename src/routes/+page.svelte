<script lang="ts">
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import VetCrewLogo from '../lib/components/VetCrewLogo.svelte';
	import ContactLinks from '../lib/components/ContactLinks.svelte';
	import HiddenPanel from '../lib/components/HiddenPanel.svelte';
	import ScrollIndicator from '../lib/components/ScrollIndicator.svelte';
	import { langStore } from '../lib/lang.svelte';
	import JsonLd from '../lib/components/JsonLd.svelte';
	import { HotkeyService, shortcutLetter } from '$lib/hotkeys/hotkeys';

	const hotkeys = getContext<HotkeyService | undefined>('hotkeys');

	// 3 Scroll States (matching DeviantBlaze architecture):
	// 1: Standard default (centered logo, clean borderless buttons, labels on hover)
	// 2: Bottom contact buttons expanded (icons grow, labels visible, logo shifts slightly up) - DEFAULT STATE
	// 3: Contact buttons shifted UP, and hidden bottom tools panel revealed
	let scrollState = $state<1 | 2 | 3>(2);

	function stepScroll(direction: number) {
		if (direction > 0) {
			scrollState = scrollState === 3 ? 1 : ((scrollState + 1) as 1 | 2 | 3);
		} else {
			scrollState = scrollState === 1 ? 3 : ((scrollState - 1) as 1 | 2 | 3);
		}
	}

	function goToState(state: 1 | 2 | 3) {
		scrollState = state;
	}

	$effect(() => {
		if (!browser || !hotkeys) return;

		const popLayer = hotkeys.pushLayer({
			handle(e) {
				if (e.code === 'Escape') {
					if (scrollState !== 1) {
						goToState(1);
						return true;
					}
					return false;
				}
				if (e.code === 'Digit1' || e.code === 'Numpad1') {
					goToState(1);
					return true;
				}
				if (e.code === 'Digit2' || e.code === 'Numpad2') {
					goToState(2);
					return true;
				}
				if (e.code === 'Digit3' || e.code === 'Numpad3') {
					goToState(3);
					return true;
				}
				if (shortcutLetter(e) === 'h') {
					goToState(1);
					return true;
				}
				if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'PageDown') {
					stepScroll(1);
					return true;
				}
				if (e.code === 'ArrowUp' || e.code === 'PageUp') {
					stepScroll(-1);
					return true;
				}
				return false;
			}
		});

		return () => popLayer();
	});

	$effect(() => {
		if (!browser) return;

		let wheelAccumulator = 0;
		let lastStepTime = 0;
		let wheelClearTimer: ReturnType<typeof setTimeout> | null = null;

		function handleWheel(e: WheelEvent) {
			e.preventDefault();

			const now = performance.now();
			wheelAccumulator += e.deltaY;

			if (wheelClearTimer) clearTimeout(wheelClearTimer);
			wheelClearTimer = setTimeout(() => {
				wheelAccumulator = 0;
			}, 140);

			// Soft, responsive scroll matching DeviantBlaze:
			// Cooldown of 55ms allows fast successive notches,
			// threshold of 40 filters minor twitches and accumulates trackpad deltas.
			const STEP_COOLDOWN = 55;
			const THRESHOLD = 40;

			if (Math.abs(wheelAccumulator) >= THRESHOLD && now - lastStepTime >= STEP_COOLDOWN) {
				stepScroll(wheelAccumulator > 0 ? 1 : -1);
				lastStepTime = now;
				wheelAccumulator = 0;
			}
		}

		let touchStartY = 0;
		function handleTouchStart(e: TouchEvent) {
			if (e.touches && e.touches[0]) {
				touchStartY = e.touches[0].clientY;
			}
		}

		function handleTouchEnd(e: TouchEvent) {
			if (e.changedTouches && e.changedTouches[0]) {
				const touchEndY = e.changedTouches[0].clientY;
				const deltaY = touchStartY - touchEndY;
				if (Math.abs(deltaY) > 42) {
					stepScroll(deltaY > 0 ? 1 : -1);
				}
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchend', handleTouchEnd, { passive: true });

		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchend', handleTouchEnd);
			if (wheelClearTimer) clearTimeout(wheelClearTimer);
		};
	});

	const organizationSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'NGO',
		name: 'Vet Crew',
		alternateName: 'VetCrew',
		url: 'https://alik532ua.github.io/VetCrew/',
		logo: 'https://alik532ua.github.io/VetCrew/logo.svg',
		image: 'https://alik532ua.github.io/VetCrew/logo.svg',
		sameAs: [
			'https://vet-crew-donation.org',
			'https://www.instagram.com/vet.crew/',
			'https://www.facebook.com/vet.crew/',
			'https://www.tiktok.com/@vet.crew'
		],
		description:
			langStore.current === 'uk'
				? 'Vet Crew — міжнародна організація з порятунку, лікування та реабілітації диких і екзотичних тварин.'
				: 'Vet Crew — international organization dedicated to rescue, care, and rehabilitation of wild and exotic animals.'
	});
</script>

<svelte:head>
	<title
		>{langStore.current === 'uk'
			? 'Vet Crew — Порятунок диких та екзотичних тварин'
			: 'Vet Crew — Wild & Exotic Animal Rescue'}</title
	>
	<meta
		name="description"
		content={langStore.current === 'uk'
			? 'Vet Crew — порятунок, лікування та реабілітація диких і екзотичних тварин. Підтримайте нашу місію.'
			: 'Vet Crew — rescue, care, and rehabilitation of wild and exotic animals. Support our mission.'}
	/>
	<link rel="canonical" href="https://alik532ua.github.io/VetCrew/" />
	<meta property="og:url" content="https://alik532ua.github.io/VetCrew/" />
	<meta
		property="og:title"
		content={langStore.current === 'uk'
			? 'Vet Crew — Порятунок диких та екзотичних тварин'
			: 'Vet Crew — Wild & Exotic Animal Rescue'}
	/>
	<meta
		property="og:description"
		content={langStore.current === 'uk'
			? 'Офіційний портал Vet Crew. Слідкуйте за порятунком тварин та підтримуйте місії.'
			: 'Official Vet Crew portal. Follow our animal rescue missions and support our cause.'}
	/>
	<meta name="twitter:card" content="summary" />
	<meta
		name="twitter:title"
		content={langStore.current === 'uk'
			? 'Vet Crew — Порятунок диких та екзотичних тварин'
			: 'Vet Crew — Wild & Exotic Animal Rescue'}
	/>
	<meta
		name="twitter:description"
		content={langStore.current === 'uk'
			? 'Офіційний портал Vet Crew. Слідкуйте за порятунком тварин та підтримуйте місії.'
			: 'Official Vet Crew portal. Follow our animal rescue missions and support our cause.'}
	/>
</svelte:head>

<JsonLd schema={organizationSchema} />

<main id="main-content" tabindex="-1" class="page-container state-{scrollState}">
	<!-- Central Hero SVG Logo with dynamic cursor reactivity -->
	<section class="hero-center state-{scrollState}" aria-label="Vet Crew">
		<VetCrewLogo />
	</section>

	<!-- Bottom Center Action Channels: Instagram, Donate, Info -->
	<ContactLinks isExpanded={scrollState === 2} isShiftedUp={scrollState === 3} />

	<!-- Hidden Actions Panel ONLY in State 3 (Theme, Lang, Fullscreen) -->
	<HiddenPanel isVisible={scrollState === 3} />

	<!-- 3-State Cyclic Scroll Indicator on Right Edge -->
	<ScrollIndicator state={scrollState} onGoToState={goToState} />
</main>

<style>
	.page-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		user-select: none;
		-webkit-user-select: none;
	}

	/* Central Hero Logo Position based on Scroll States */
	.hero-center {
		position: relative;
		z-index: 10;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform;
	}

	/* State 1: Default standard position */
	.hero-center.state-1 {
		transform: translateY(0);
	}

	/* State 2: Softly shifts slightly up as bottom channels expand */
	.hero-center.state-2 {
		transform: translateY(-8vh);
	}

	/* State 3: Shifts slightly further up for hidden panel */
	.hero-center.state-3 {
		transform: translateY(-13vh);
	}

	@media (max-width: 640px) {
		.hero-center {
			padding-bottom: 4.5rem;
		}

		.hero-center.state-2 {
			transform: translateY(-6vh);
		}

		.hero-center.state-3 {
			transform: translateY(-10vh);
		}
	}
</style>
