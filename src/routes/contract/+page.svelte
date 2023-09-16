<script lang="ts">
	import BelieveCope from '$lib/BelieveCope.svelte';
	import Button from '$lib/Button.svelte';
	import CandleStickChart from '$lib/CandleStickChart.svelte';
	import type { PageData } from './$types';
	import { currentAccountStore } from '../../lib/store';
	import Table from '$lib/Table.svelte';

	let showForm = false;
	let operation: 'buyForShares' | 'sellForShares' | 'buyAgainstShares' | 'sellAgainstShares' | '' =
		'';

	function toggleForm(
		op: 'buyForShares' | 'sellForShares' | 'buyAgainstShares' | 'sellAgainstShares'
	) {
		operation = op;
		showForm = true;
	}

	let currentUuid;
	currentAccountStore.subscribe((value) => {
		currentUuid = value;
	});

	export let data: PageData;
</script>

<div class="flex flex-col gap-8 text-xl font-light w-full">
	<div class="flex justify-between">
		<div class="space-y-2">
			<h1 class="">{data.props?.post.title}</h1>
			<BelieveCope />
		</div>
		<div class="w-10" />
		<div class="text-right">
			<h1 class="whitespace-nowrap">Your current profit:</h1>
			<p class="text-green-500">+93.80 tokens</p>
		</div>
	</div>
	<div class="w-full h-screen">
		<CandleStickChart />
	</div>
	<div class="space-y-1">
		<div class="flex justify-between">
			<p>Your current holdings:</p>
			<p class="text-right">Volume</p>
		</div>
		<div class="grid grid-cols-[auto,auto,auto,auto,1fr] grid-rows-3 gap-x-3 gap-y-1">
			<p>Believe:</p>
			<p class="text-green-500">10 Shares</p>
			<Button class="text-sm py-1 px-2 text-green-500" on:click={() => toggleForm('buyForShares')}
				>Buy</Button
			>
			<Button class="text-sm py-1 px-2 text-green-500" on:click={() => toggleForm('sellForShares')}
				>Sell</Button
			>
			<p class="text-right">8000</p>
			<p>Cope:</p>
			<p class="text-red-500">10 Shares</p>
			<Button class="text-sm py-1 px-2 text-red-500" on:click={() => toggleForm('buyAgainstShares')}
				>Buy</Button
			>
			<Button
				class="text-sm py-1 px-2 text-red-500"
				on:click={() => toggleForm('sellAgainstShares')}>Sell</Button
			>
			<p class="text-right">6123</p>
		</div>
	</div>

	{#if showForm}
		<div class="space-y-4">
			{#if operation === 'buyForShares' || operation === 'sellForShares'}
				<h1>{operation === 'buyForShares' ? 'Buy' : 'Sell'} Believe Shares</h1>
			{:else}
				<h1>{operation === 'buyAgainstShares' ? 'Buy' : 'Sell'} Cope Shares</h1>
			{/if}
			<form class="flex flex-col gap-2" method="POST">
				<input type="hidden" name="actionType" bind:value={operation} />

				<!-- Hidden input for currentUuid -->
				<input type="hidden" name="currentUuid" bind:value={currentUuid} />

				<label for="contractId">Contract ID</label>
				<input type="text" name="contractId" id="contractId" placeholder="Contract ID" required />

				<label for="price">Price</label>
				<input type="number" name="price" id="price" placeholder="Price" min="1" required />

				<label for="amount">Amount</label>
				<input type="number" name="amount" id="amount" placeholder="Amount" min="1" required />

				<button class="w-fit p-2 text-2xl" type="submit">Submit</button>
			</form>
		</div>
	{/if}

	<div>
		<h1>Background & Due Diligence</h1>
		<div class="my-2 p-2 bg-black rounded-xl text-neutral-300 font-thin">
			{@html data.props?.post.content}
		</div>
	</div>
</div>

<Table />

<style>
	input,
	textarea {
		@apply bg-black rounded-md p-2 mb-4;
	}
	h1 {
		@apply text-white font-light text-3xl;
	}
	label {
		@apply text-white font-light text-xl;
	}
</style>
