<script>
	import { onMount } from 'svelte';
	import { db } from '../services/firebase/firebase';
	import { getDocs, collection } from 'firebase/firestore';
	import Button from '$lib/Button.svelte';
	import ContractThumbnail from '$lib/ContractThumbnail.svelte';

	let contracts = [];

	onMount(async () => {
		const contractCollection = collection(db, 'contracts');
		const snapshot = await getDocs(contractCollection);

		contracts = snapshot.docs.map((doc) => doc.data());
	});
</script>

<div class="flex flex-col justify-center items-center gap-6 text-white">
	<h1 class="font-light text-5xl">Bet on people you know</h1>
	<p>the first web3 contract-based prediction market</p>
	<input
		type="text"
		class="w-4/5 h-12 rounded-md border-2 border-neutral-700 bg-black p-2"
		placeholder="Search for contracts"
	/>
	<Button class="hover:bg-neutral-800 transition-colors">or list your own</Button>
	<div class="flex items-center justify-center w-full">
		<div class="grid grid-cols-3 gap-4 w-3/4">
			{#each contracts as contract}
				<ContractThumbnail
					title={contract.title}
					endDate={contract.end_date ? new Date(contract.end_date) : null}
					href={`/contract?id=${contract.id}`}
				/>
			{/each}
		</div>
	</div>
</div>
