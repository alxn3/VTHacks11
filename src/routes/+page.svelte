<script>
	import ContractThumbnail from '$lib/ContractThumbnail.svelte';
</script>

<div
	class="w-full h-screen flex flex-col justify-center items-center gap-4 bg-neutral-900 text-white"
>
	<h1 class="font-light text-5xl">Bet on people you know</h1>
	<p>the first web3 contract-based prediction model</p>
	<input
		type="text"
		class="w-4/5 h-12 rounded-md border-2 border-neutral-700 bg-black p-2"
		placeholder="Search for contracts"
	/>
	<button class="border-2 border-neutral-700 py-2 px-10 rounded-xl"> or list your own </button>
	<div class="flex items-center justify-center">
		<div class="grid grid-cols-3 gap-2 w-3/4">
			{#each [1, 2, 3, 4, 5, 6] as i}
				<ContractThumbnail />
			{/each}
		</div>
	</div>
</div>
