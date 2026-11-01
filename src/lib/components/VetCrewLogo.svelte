<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { MediaQuery } from 'svelte/reactivity';
	import logoPaths from '../assets/logo-paths.json';

	interface Props {
		compact?: boolean;
		onclick?: () => void;
	}

	let { compact = false, onclick }: Props = $props();

	// Reactive media query abstractions (В§ 1.5)
	const isMobile = new MediaQuery('(max-width: 768px), (pointer: coarse)');
	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let svgElement = $state<SVGSVGElement | null>(null);

	// Mouse state in window coordinates (-1 to 1 normalized)
	let normX = $state(0);
	let normY = $state(0);
	let rawSvgX = $state(485.31);
	let rawSvgY = $state(485.31);
	let isHovering = $state(false);

	// Smoothed global 3D tilt angles (degrees)
	let smoothTiltX = $state(0);
	let smoothTiltY = $state(0);

	// Specular highlight gradient coords (%) with smooth lerping
	let glowX = $state(50);
	let glowY = $state(50);
	let targetGlowX = $state(50);
	let targetGlowY = $state(50);

	// Static logo geometry and definitions (В§ 1.3 - separated from dynamic transform state)
	const pawToes = [
		logoPaths['paw-toe-left'],
		logoPaths['paw-toe-center-left'],
		logoPaths['paw-toe-center-right'],
		logoPaths['paw-toe-right']
	];

	const pawPad = logoPaths['paw-pad'];
	const textVetCrew = logoPaths['text-vet-crew'];

	// Lightweight numeric transform state for high-FPS animation
	interface AnimTransform {
		currX: number;
		currY: number;
		currRot: number;
		currScale: number;
		targetX: number;
		targetY: number;
		targetRot: number;
		targetScale: number;
	}

	interface ToeItem {
		def: (typeof pawToes)[number];
		currX: number;
		currY: number;
		currRot: number;
		currScale: number;
		targetX: number;
		targetY: number;
		targetRot: number;
		targetScale: number;
	}

	let toes = $state<ToeItem[]>(
		pawToes.map((def) => ({
			def,
			currX: 0,
			currY: 0,
			currRot: 0,
			currScale: 1,
			targetX: 0,
			targetY: 0,
			targetRot: 0,
			targetScale: 1
		}))
	);

	let padTransform = $state<AnimTransform>({
		currX: 0,
		currY: 0,
		currRot: 0,
		currScale: 1,
		targetX: 0,
		targetY: 0,
		targetRot: 0,
		targetScale: 1
	});

	let textVetCrewTransform = $state<AnimTransform>({
		currX: 0,
		currY: 0,
		currRot: 0,
		currScale: 1,
		targetX: 0,
		targetY: 0,
		targetRot: 0,
		targetScale: 1
	});

	onMount(() => {
		let animId: number;

		let hasOrientation = false;
		let tiltNormX = 0; // -1 to +1
		let tiltNormY = 0; // -1 to +1

		function handleOrientation(e: DeviceOrientationEvent) {
			if (e.gamma == null || e.beta == null) return;
			hasOrientation = true;
			const gamma = Math.max(-30, Math.min(30, e.gamma));
			const betaDelta = Math.max(-30, Math.min(30, e.beta - 45));
			tiltNormX = gamma / 30;
			tiltNormY = betaDelta / 30;
		}

		// Device orientation setup
		const DeviceOrientation = browser
			? (
					window as unknown as {
						DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
					}
				).DeviceOrientationEvent
			: null;
		if (DeviceOrientation && typeof DeviceOrientation.requestPermission !== 'function') {
			window.addEventListener('deviceorientation', handleOrientation, { passive: true });
		}

		function requestGyroOnce() {
			if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
				DeviceOrientation.requestPermission()
					.then((state: string) => {
						if (state === 'granted') {
							window.addEventListener('deviceorientation', handleOrientation, { passive: true });
						}
					})
					.catch(() => {});
			}
			window.removeEventListener('pointerdown', requestGyroOnce);
			window.removeEventListener('touchstart', requestGyroOnce);
		}
		window.addEventListener('pointerdown', requestGyroOnce, { passive: true });
		window.addEventListener('touchstart', requestGyroOnce, { passive: true });

		function onPointerMove(e: PointerEvent) {
			if (isMobile.current || e.pointerType === 'touch') {
				isHovering = false;
				return;
			}

			const winW = window.innerWidth;
			const winH = window.innerHeight;

			normX = (e.clientX / winW) * 2 - 1;
			normY = (e.clientY / winH) * 2 - 1;

			document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / winW) * 100}%`);
			document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / winH) * 100}%`);

			if (svgElement) {
				const rect = svgElement.getBoundingClientRect();
				rawSvgX = ((e.clientX - rect.left) / rect.width) * 970.62;
				rawSvgY = ((e.clientY - rect.top) / rect.height) * 970.62;

				targetGlowX = Math.max(5, Math.min(95, (rawSvgX / 970.62) * 100));
				targetGlowY = Math.max(5, Math.min(95, (rawSvgY / 970.62) * 100));
			}

			isHovering = true;
		}

		function onPointerLeave() {
			isHovering = false;
		}

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave);

		function loop(time: number) {
			if (prefersReducedMotion.current) {
				smoothTiltX = 0;
				smoothTiltY = 0;
				glowX = 50;
				glowY = 50;
				animId = requestAnimationFrame(loop);
				return;
			}

			const idleT = time * 0.001;

			let targetTiltX: number;
			let targetTiltY: number;

			if (isMobile.current) {
				// MOBILE MODE:
				targetGlowX = 50 + Math.sin(idleT * 0.8) * 22;
				targetGlowY = 50 + Math.cos(idleT * 0.6) * 18;

				document.documentElement.style.setProperty(
					'--mouse-x',
					`${50 + Math.sin(idleT * 0.5) * 15}%`
				);
				document.documentElement.style.setProperty(
					'--mouse-y',
					`${50 + Math.cos(idleT * 0.4) * 12}%`
				);

				const breathTiltX = Math.sin(idleT * 0.7) * 3.2;
				const breathTiltY = Math.cos(idleT * 0.5) * 3.2;

				if (hasOrientation) {
					targetTiltX = -tiltNormY * 6.5 + breathTiltX * 0.35;
					targetTiltY = tiltNormX * 6.5 + breathTiltY * 0.35;
				} else {
					targetTiltX = breathTiltX;
					targetTiltY = breathTiltY;
				}

				// Idle floating waves for elements
				for (const el of toes) {
					const wave = Math.sin(time * 0.0022 + el.def.phase) * 3.2;
					const rot = Math.cos(time * 0.0018 + el.def.phase) * 1.0;
					el.targetX = hasOrientation ? tiltNormX * 2.5 : 0;
					el.targetY = wave + (hasOrientation ? -tiltNormY * 2.5 : 0);
					el.targetRot = rot;
					el.targetScale = 1;

					el.currX += (el.targetX - el.currX) * 0.1;
					el.currY += (el.targetY - el.currY) * 0.1;
					el.currRot += (el.targetRot - el.currRot) * 0.1;
					el.currScale += (el.targetScale - el.currScale) * 0.1;
				}

				// Paw pad
				const padWave = Math.sin(time * 0.002 + pawPad.phase) * 2.5;
				padTransform.targetY = padWave;
				padTransform.currY += (padTransform.targetY - padTransform.currY) * 0.08;

				// Vet Crew text
				const textWave = Math.sin(time * 0.0018 + textVetCrew.phase) * 2.0;
				textVetCrewTransform.targetY = textWave;
				textVetCrewTransform.currY +=
					(textVetCrewTransform.targetY - textVetCrewTransform.currY) * 0.08;
			} else {
				// DESKTOP MODE:
				let targetNormX = normX;
				let targetNormY = normY;
				let activeSvgX = rawSvgX;
				let activeSvgY = rawSvgY;

				if (!isHovering) {
					targetNormX = Math.sin(idleT * 0.8) * 0.22;
					targetNormY = Math.cos(idleT * 0.6) * 0.18;
					activeSvgX = 485.31 + Math.sin(idleT * 0.9) * 200;
					activeSvgY = 485.31 + Math.cos(idleT * 0.7) * 150;
					targetGlowX = (activeSvgX / 970.62) * 100;
					targetGlowY = (activeSvgY / 970.62) * 100;
				}

				targetTiltX = -targetNormY * 11;
				targetTiltY = targetNormX * 11;

				// Local coordinate inside <g transform="translate(0, 55)">
				const localCursorX = activeSvgX;
				const localCursorY = activeSvgY - 55;

				// Update toes with cursor physics
				for (const el of toes) {
					const radius = 320;
					const dx = localCursorX - el.def.cx;
					const dy = localCursorY - el.def.cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const idleWave = Math.sin(time * 0.0022 + el.def.phase) * 3.0;

					if (dist < radius) {
						const t = 1 - dist / radius;
						const ease = t * t * (3 - 2 * t);
						const nx = dx / (dist || 1);
						const ny = dy / (dist || 1);

						el.targetX = -nx * ease * 28;
						el.targetY = -ny * ease * 28 + idleWave;
						el.targetRot = -nx * ease * 8;
						el.targetScale = 1 + ease * 0.08;
					} else {
						el.targetX = 0;
						el.targetY = idleWave;
						el.targetRot = 0;
						el.targetScale = 1;
					}

					el.currX += (el.targetX - el.currX) * 0.11;
					el.currY += (el.targetY - el.currY) * 0.11;
					el.currRot += (el.targetRot - el.currRot) * 0.11;
					el.currScale += (el.targetScale - el.currScale) * 0.11;
				}

				// Update paw pad
				{
					const dx = localCursorX - pawPad.cx;
					const dy = localCursorY - pawPad.cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const idleWave = Math.sin(time * 0.002 + pawPad.phase) * 2.5;

					if (dist < 360) {
						const t = 1 - dist / 360;
						const ease = t * t * (3 - 2 * t);
						const nx = dx / (dist || 1);
						const ny = dy / (dist || 1);
						padTransform.targetX = -nx * ease * 20;
						padTransform.targetY = -ny * ease * 20 + idleWave;
						padTransform.targetScale = 1 + ease * 0.06;
					} else {
						padTransform.targetX = 0;
						padTransform.targetY = idleWave;
						padTransform.targetScale = 1;
					}
					padTransform.currX += (padTransform.targetX - padTransform.currX) * 0.1;
					padTransform.currY += (padTransform.targetY - padTransform.currY) * 0.1;
					padTransform.currScale += (padTransform.targetScale - padTransform.currScale) * 0.1;
				}

				// Vet Crew text subtle lift
				{
					const dx = localCursorX - textVetCrew.cx;
					const dy = localCursorY - textVetCrew.cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const idleWave = Math.sin(time * 0.0018 + textVetCrew.phase) * 2.0;
					if (dist < 380) {
						const ease = Math.max(0, 1 - dist / 380);
						textVetCrewTransform.targetScale = 1 + ease * 0.05;
						textVetCrewTransform.targetY = idleWave - ease * 8;
					} else {
						textVetCrewTransform.targetScale = 1;
						textVetCrewTransform.targetY = idleWave;
					}
					textVetCrewTransform.currScale +=
						(textVetCrewTransform.targetScale - textVetCrewTransform.currScale) * 0.1;
					textVetCrewTransform.currY +=
						(textVetCrewTransform.targetY - textVetCrewTransform.currY) * 0.1;
				}
			}

			// Lerp global 3D tilt
			smoothTiltX += (targetTiltX - smoothTiltX) * 0.08;
			smoothTiltY += (targetTiltY - smoothTiltY) * 0.08;

			// Lerp specular highlight sheen smoothly
			glowX += (targetGlowX - glowX) * 0.06;
			glowY += (targetGlowY - glowY) * 0.06;

			animId = requestAnimationFrame(loop);
		}

		animId = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('deviceorientation', handleOrientation);
			window.removeEventListener('pointerdown', requestGyroOnce);
			window.removeEventListener('touchstart', requestGyroOnce);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<div
	class="logo-container"
	class:is-compact={compact}
	{onclick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick?.();
		}
	}}
	aria-label="Vet Crew Logo"
>
	<div
		class="logo-stage"
		style="transform: perspective(1200px) rotateX({smoothTiltX.toFixed(
			2
		)}deg) rotateY({smoothTiltY.toFixed(2)}deg);"
	>
		<svg
			bind:this={svgElement}
			class="vet-crew-svg"
			viewBox="0 0 970.62 970.62"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<!-- Specular sheen gradient following pointer/gyro -->
				<radialGradient
					id="specular-highlight"
					cx="{glowX.toFixed(1)}%"
					cy="{glowY.toFixed(1)}%"
					r="75%"
				>
					<stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
					<stop offset="40%" stop-color="#ffffff" stop-opacity="0.05" />
					<stop offset="75%" stop-color="#ffffff" stop-opacity="0.0" />
					<stop offset="100%" stop-color="#000000" stop-opacity="0.12" />
				</radialGradient>

				<!-- Subtle metallic rim rim-glow -->
				<linearGradient id="rim-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#598f3a" stop-opacity="0.8" />
					<stop offset="50%" stop-color="#ffb327" stop-opacity="0.4" />
					<stop offset="100%" stop-color="#13371b" stop-opacity="0.9" />
				</linearGradient>

				<!-- Soft shadow under the paw -->
				<filter id="paw-shadow" x="-10%" y="-10%" width="120%" height="120%">
					<feDropShadow
						dx="0"
						dy="8"
						stdDeviation="12"
						flood-color="#000000"
						flood-opacity="0.32"
					/>
				</filter>
			</defs>

			<!-- 1. Background Circle -->
			<circle
				id="bg-circle"
				cx="485.31"
				cy="485.31"
				r="461.76"
				fill="var(--logo-bg-circle, #13371b)"
				stroke="url(#rim-gradient)"
				stroke-width="5"
			/>

			<!-- 2. Dynamic Specular Sheen Overlay -->
			<circle
				class="sheen-overlay"
				cx="485.31"
				cy="485.31"
				r="461.76"
				fill="url(#specular-highlight)"
				pointer-events="none"
			/>

			<!-- 3. Logo Content Group -->
			<g id="logo-content" transform="translate(0, 55)">
				<!-- Paw Print with individual dynamic toes -->
				<g id="paw" fill="var(--logo-paw, #ffffff)" filter="url(#paw-shadow)">
					{#each toes as toe (toe.def.id)}
						<g
							transform="translate({toe.currX.toFixed(2)}, {toe.currY.toFixed(2)}) translate({toe
								.def.cx}, {toe.def.cy}) rotate({toe.currRot.toFixed(
								2
							)}) scale({toe.currScale.toFixed(3)}) translate(-{toe.def.cx}, -{toe.def.cy})"
						>
							<path id={toe.def.id} d={toe.def.d} />
						</g>
					{/each}

					<!-- Paw Pad -->
					<g
						transform="translate({padTransform.currX.toFixed(2)}, {padTransform.currY.toFixed(
							2
						)}) translate({pawPad.cx}, {pawPad.cy}) scale({padTransform.currScale.toFixed(
							3
						)}) translate(-{pawPad.cx}, -{pawPad.cy})"
					>
						<path id={pawPad.id} d={pawPad.d} />
					</g>
				</g>

				<!-- Text: VET CREW -->
				<g
					transform="translate(0, {textVetCrewTransform.currY.toFixed(
						2
					)}) translate({textVetCrew.cx}, {textVetCrew.cy}) scale({textVetCrewTransform.currScale.toFixed(
						3
					)}) translate(-{textVetCrew.cx}, -{textVetCrew.cy})"
				>
					<path id="text-vet-crew" fill="var(--logo-vet-crew, #ffb327)" d={textVetCrew.d} />
				</g>
			</g>
		</svg>
	</div>
</div>

<style>
	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		cursor: pointer;
		outline: none;
		transition:
			transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
			filter 0.5s ease;
	}

	.logo-stage {
		width: min(72vw, 380px);
		height: min(72vw, 380px);
		max-width: 440px;
		max-height: 440px;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.12s linear;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.vet-crew-svg {
		width: 100%;
		height: 100%;
		display: block;
		overflow: visible;
		filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.5))
			drop-shadow(0 0 25px rgba(89, 143, 58, 0.25));
		transition: filter 0.5s ease;
	}

	.vet-crew-svg path,
	.vet-crew-svg circle,
	.vet-crew-svg g {
		transition: fill var(--transition-speed) var(--transition-easing);
	}

	.sheen-overlay {
		opacity: var(--logo-sheen-opacity, 0.5);
		mix-blend-mode: var(--logo-sheen-blend, overlay);
		transition: opacity var(--transition-speed) var(--transition-easing);
	}

	:global([data-theme='light']) .vet-crew-svg {
		filter: drop-shadow(0 20px 40px rgba(19, 55, 27, 0.22))
			drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
	}

	.logo-container:hover .vet-crew-svg {
		filter: drop-shadow(0 22px 55px rgba(0, 0, 0, 0.6))
			drop-shadow(0 0 35px rgba(255, 179, 39, 0.35));
	}

	@media (max-width: 600px) {
		.logo-stage {
			width: min(76vw, 290px);
			height: min(76vw, 290px);
		}
	}
</style>
