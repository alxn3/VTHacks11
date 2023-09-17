<script lang="ts">
	import BelieveCope from '$lib/BelieveCope.svelte';
	import Button from '$lib/Button.svelte';
	import CandleStickChart from '$lib/CandleStickChart.svelte';
	import type { PageData } from './$types';
	import { currentAccountStore } from '../../lib/store';
	import Table from '$lib/Table.svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { db } from '../../services/firebase/firebase';
	import {
		addDoc,
		collection,
		doc,
		getDoc,
		getDocs,
		query,
		updateDoc,
		where
	} from 'firebase/firestore';
	import { bin } from 'd3';
	export let post: { title: string; content: string };

	let showForm = false;
	let operation: 'buyForShares' | 'sellForShares' | 'buyAgainstShares' | 'sellAgainstShares' | '' =
		'';

	function toggleForm(
		op: 'buyForShares' | 'sellForShares' | 'buyAgainstShares' | 'sellAgainstShares'
	) {
		operation = op;
		showForm = true;
	}

	let currentUuid: string | null;
	let contractId: string | null;
	let walletId = get(currentAccountStore);
	currentAccountStore.subscribe((value) => {
		walletId = value;
	});
	onMount(() => {
		const url = new URL(window.location.href);
		const id = url.searchParams.get('id');
		contractId = id;

		const q = query(
			collection(db, 'users'),
			where('uuid', '==', window.sessionStorage.getItem('currentAccount'))
		);
		// get docref id and store it in currentUuid
		getDocs(q).then((querySnapshot) => {
			if (!querySnapshot.empty) {
				currentUuid = querySnapshot.docs[0].id;
			}
		});
	});

	export let data: PageData;
</script>

<div class="flex flex-col gap-8 text-xl font-light w-full">
	<div class="flex justify-between">
		<div class="space-y-2">
			<h1 class="">{data.title}</h1>
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
				<input type="hidden" name="contractId" bind:value={contractId} />
				<input type="hidden" name="walletId" bind:value={walletId} />

				<!-- <label for="contractId">Contract ID</label>
				<input type="text" name="contractId" id="contractId" placeholder="Contract ID" required /> -->
				<label for="ordertype">Order Type</label>
				<!-- selection buttons for market order or limit -->
				<div class="flex gap-2">
					<label for="market">
						<input type="radio" name="ordertype" id="market" value="market" required checked />
						Market
					</label>
					<label for="limit">
						<input type="radio" name="ordertype" id="limit" value="limit" required />
						Limit
					</label>
				</div>
				<label for="price">Price</label>
				<input
					type="number"
					name="price"
					id="price"
					placeholder="Price"
					min="1"
					required
					step="0.01"
				/>

				<label for="amount">Amount</label>
				<input
					type="number"
					name="amount"
					id="amount"
					placeholder="Amount"
					min="1"
					required
					step="0.01"
				/>

				<button class="w-fit p-2 text-2xl" type="submit">Submit</button>
			</form>
		</div>
	{/if}

	<div>
		<h1>Background & Due Diligence</h1>
		<div class="my-2 p-2 bg-black rounded-xl text-neutral-300 font-thin">
			{@html data.description}
		</div>
	</div>
</div>

<div class="space-y-4">
	<div class="border-[1px] border-neutral-700 rounded-xl bg-neutral-950 text-neutral-200 w-full">
		<h2 class="p-2 text-center">Against</h2>
		<table class="table-fixed w-full">
			<thead>
				<tr>
					<th>Ask</th>
					<th>Bid</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><Table data={data.against_orderbook.asks} /></td>
					<td><Table data={data.against_orderbook.bids} /></td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="border-[1px] border-neutral-700 rounded-xl bg-neutral-950 text-neutral-200 w-full">
		<h2 class="p-2 text-center">For</h2>
		<table class="table-fixed w-full">
			<thead>
				<tr>
					<th>Ask</th>
					<th>Bid</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><Table data={data.for_orderbook.asks} /></td>
					<td><Table data={data.for_orderbook.bids} /></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

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

	h2 {
		@apply text-xl font-thin;
	}

	td {
		@apply align-top;
	}
</style>
