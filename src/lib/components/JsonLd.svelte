<script lang="ts">
	import { jsonLdScript } from '$lib/security/jsonLd';

	interface Props {
		schema: object;
	}

	let { schema }: Props = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript(schema)}
</svelte:head>

