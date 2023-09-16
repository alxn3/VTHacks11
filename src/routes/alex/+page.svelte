<script>
	import Button from '$lib/Button.svelte';
	import ContractThumbnail from '$lib/ContractThumbnail.svelte';
</script>

<div class="flex items-center justify-center w-full h-screen bg-neutral-900">
	<div class="grid grid-cols-3 gap-2 w-3/4">
		{#each [1, 2, 3, 4, 5, 6] as i}
			<ContractThumbnail />
		{/each}
	</div>
</div>
